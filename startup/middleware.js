const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const winston = require('../logger/winston')
const express = require('express')

module.exports = function (app) {
  app.use(
    cors({
      origin: 'http://localhost:4200',
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })
  )

  app.use(express.json())
  app.use(helmet())

  if (app.get('env') === 'development') {
    app.use(morgan('dev'))
    winston.info('Morgan is enabled.')
  }
}
