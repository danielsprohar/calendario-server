const { Sequelize } = require('sequelize')
require('dotenv').config()

module.exports = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 1,
    acquire: 30000,
    idle: 1000,
  },
})
