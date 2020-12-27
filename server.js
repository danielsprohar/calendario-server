const express = require('express')
const app = express()
const winston = require('./logger/winston')
const eventsRouter = require('./routes/events.route')
const database = require('./database/postgres-sequelize')
const errorHandlerMiddleware = require('./middleware/error-handler')
require('./startup/middleware')(app)

// Catch rejected promises
process.on('unhandledRejection', (err) => {
  // Let winston take care of the rest
  throw err
})

// ===========================================================================
// Add the necessary middleware and routers
// ===========================================================================

app.use(express.json())
app.use('/api/events', eventsRouter)
app.use(errorHandlerMiddleware)

// ===========================================================================
// Start the server
// ===========================================================================

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
  winston.info('Now listening on port ' + port)
})

// Uncomment the lines below to let Sequelize create the database
// database.sync().then(() => {
//   winston.info('Connected to database')
// })

database.validate().then(() => winston.info('Connected to database'))

module.exports = server
