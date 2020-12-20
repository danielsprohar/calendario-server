const { createLogger, transports, format } = require('winston')
// TODO: Add file rotation

const logger = createLogger({
  level: 'info',
  format: format.prettyPrint(),
  // defaultMeta: { service: 'user-service' },
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      tailable: true,
    }),
    // - Write all logs with level `info` and below to `combined.log`
    new transports.File({ filename: 'logs/combined.log', tailable: true }),
  ],
  exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
        format.colorize()
      ),
      debugStdout: true,
      handleExceptions: true,
    })
  )
}

module.exports = logger
