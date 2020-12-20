const express = require('express')
const router = express.Router()
const logger = require('../logger/winston')
const Event = require('../models/event')
const httpStatus = require('../constants/http-status-codes')
const regexPatterns = require('../constants/regex-patterns')
const { Op } = require('sequelize')

// ===========================================================================
// Create
// ===========================================================================

router.post('/', async (req, res, next) => {
  const { error } = Event.validateCreateModel(req.body)
  if (error) {
    return res
      .status(httpStatus.unprocessableEntity)
      .send(error.details[0].message)
  }

  const start = new Date(req.body.startDate)
  const end = new Date(req.body.endDate)

  if (!Event.validateDateInterval(start, end)) {
    return res
      .status(httpStatus.unprocessableEntity)
      .send(
        'Invalid date interval. The "startDate" must be less than or equal to the "endDate"'
      )
  }

  const predicates = [
    {
      start_date: {
        [Op.between]: [start, end],
      },
      end_date: {
        [Op.between]: [start, end],
      },
    },
  ]

  try {
    const count = await Event.count({
      where: predicates,
    })
    if (count) {
      return res
        .status(httpStatus.unprocessableEntity)
        .send(
          'An event exists within the desired time span. Please choose another time interval.'
        )
    }
  } catch (e) {
    next(e)
  }

  try {
    const event = await Event.create(req.body)
    logger.info('New event created')
    logger.info(event.toJSON())
    return res.json(event)
  } catch (e) {
    next(e)
  }
})

// ===========================================================================
// Read
// ===========================================================================

router.get('/', async (req, res, next) => {
  const pageIndex = req.query.pageIndex || 0
  const pageSize = req.query.pageSize || 30
  const options = {
    order: ['startDate'],
    limit: pageSize,
    offset: pageIndex * pageSize,
  }

  if (
    (req.query.startDate && !req.query.endDate) ||
    (req.query.endDate && !req.query.startDate)
  ) {
    return res
      .status(httpStatus.badRequest)
      .send(
        'To query events by a date interval, both starting and ending dates are required'
      )
  }

  if (req.query.startDate && req.query.endDate) {
    // Check if the query parameters are in '2020-03-15' format or milliseconds since epoch.
    const start = new Date(
      req.query.startDate.search(regexPatterns.onlyDigits) === -1
        ? req.query.startDate
        : +req.query.startDate
    )
    const end = new Date(
      req.query.endDate.search(regexPatterns.onlyDigits) === -1
        ? req.query.endDate
        : +req.query.endDate
    )

    options.where = [
      {
        start_date: {
          [Op.between]: [start, end],
        },
        end_date: {
          [Op.between]: [start, end],
        },
      },
    ]
  }

  try {
    const { count, rows: events } = await Event.findAndCountAll(options)

    return res.json({
      count,
      pageIndex,
      pageSize,
      data: events,
    })
  } catch (e) {
    next(e)
  }
})

// ===========================================================================

router.get('/:id', async (req, res, next) => {
  const { error } = Event.validateGuid(req.params.id)
  if (error) {
    return res.status(httpStatus.badRequest).send(error.details[0].message)
  }

  try {
    const event = await Event.findOne({
      where: {
        id: req.params.id,
      },
    })

    if (!event) {
      return res.status(httpStatus.notFound).send()
    }

    return res.json(event)
  } catch (e) {
    next(e)
  }
})

// ===========================================================================
// Update
// ===========================================================================

router.put('/:id', async (req, res, next) => {
  let validationResult = Event.validateGuid(req.params.id)
  if (validationResult.error) {
    return res
      .status(httpStatus.badRequest)
      .send(validationResult.error.details[0].message)
  }

  validationResult = Event.validateUpdateModel(req.body)
  if (validationResult.error) {
    return res
      .status(httpStatus.unprocessableEntity)
      .send(validationResult.error.details[0].message)
  }

  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(httpStatus.notFound).send()
    }

    Object.assign(event, req.body)
    if (!Event.validateDateInterval(event.startDate, event.endDate)) {
      return res
        .status(httpStatus.unprocessableEntity)
        .send(
          'Invalid date interval. The "startDate" must be less than or equal to the "endDate"'
        )
    }

    await event.save()

    res.status(httpStatus.noContent).send()
  } catch (e) {
    next(e)
  }
})

// ===========================================================================
// Delete
// ===========================================================================

router.delete('/:id', async (req, res, next) => {
  const { error } = Event.validateGuid(req.params.id)
  if (error) {
    return res.status(httpStatus.badRequest).send(error.details[0].message)
  }

  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(httpStatus.notFound).send()
    }

    await event.destroy()
    logger.info('An event was deleted')
    logger.info(event.toJSON())
    return res.sendStatus(httpStatus.noContent)
  } catch (e) {
    next(e)
  }
})

// ===========================================================================

module.exports = router
