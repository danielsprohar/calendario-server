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
  const { error } = Event.validateModel(req.body)
  if (error) {
    return res
      .status(httpStatus.unprocessableEntity)
      .send(error.details[0].message)
  }

  const startDate = req.body.startDate
  const endDate = req.body.endDate

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
  const { error } = Event.validateModel(req.body)
  if (error) {
    return res
      .status(httpStatus.unprocessableEntity)
      .send(error.details[0].message)
  }

  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(httpStatus.notFound).send()
    }

    Object.assign(event, req.body)
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
