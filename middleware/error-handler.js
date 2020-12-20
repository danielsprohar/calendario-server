const logger = require('../logger/winston')
const httpStatusCodes = require('../constants/http-status-codes')

module.exports = function handleError(err, req, res, next) {
  logger.error(err.message, err)
  res.status(httpStatusCodes.internalServerError).send()
}
