const { DataTypes, Model } = require('sequelize')
const Joi = require('joi')
const sequelize = require('../database/postgres-sequelize')

// ===========================================================================
// Valid enum values
// ===========================================================================

const statuses = ['busy', 'free']
const repeatValues = [
  'never',
  'daily',
  'weekly',
  'monthly',
  'annually',
  'every weekday',
]

// ===========================================================================
// Extend the model
// ===========================================================================

class Event extends Model {
  static validateModel(event) {
    const schema = Joi.object({
      id: Joi.string(),
      title: Joi.string().max(512).required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      status: Joi.string().valid(...statuses),
      repeats: Joi.string().valid(...repeatValues),
      description: Joi.string().max(2048),
    })

    return schema.validate(event)
  }
}

// ===========================================================================
// Initialize the model
// ===========================================================================

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(512),
      allowNull: false,
      set(value) {
        this.setDataValue('title', value.trim())
      },
    },
    status: {
      type: DataTypes.ENUM,
      values: statuses,
      defaultValue: 'busy',
    },
    description: {
      type: DataTypes.STRING(2048),
      set(value) {
        this.setDataValue('description', value.trim())
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    repeats: {
      type: DataTypes.ENUM,
      values: repeatValues,
      defaultValue: 'never',
    },
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'event_start_date',
        fields: ['start_date'],
      },
    ],
  }
)

// ===========================================================================
// Export
// ===========================================================================

module.exports = Event
