const request = require('supertest')
const httpStatusCodes = require('../../../constants/http-status-codes')
const Event = require('../../../models/event')

// ========================================================

async function initDb() {
  await Event.bulkCreate([
    {
      title: 'Finish writing API',
      startDate: '2020-12-21T05:00:00',
      endDate: '2020-12-21T08:00:00',
    },
    {
      title: 'Finish testing API',
      startDate: '2020-12-21',
      endDate: '2020-12-22',
    },
    {
      title: 'Finish writing webapp',
      startDate: '2020-12-25',
      endDate: '2020-12-25',
    },
    {
      title: 'Finish testing webapp',
      startDate: '2020-12-26',
      endDate: '2020-12-26',
    },
  ])
}

// ========================================================

async function clearDb() {
  await Event.destroy({
    where: {},
  })
}

// ========================================================
// Top-level test suite
// ========================================================
describe('/api/events', () => {
  let server = null

  beforeEach(() => {
    server = require('../../../server')
  })

  afterEach(async () => {
    await clearDb()
    if (server) {
      await server.close()
    }
  })

  // ======================================================

  describe('POST /', () => {
    it('should return 422 for an invalid request body', async () => {
      const res = await request(server).post('/api/events').send({})
      expect(res.status).toBe(httpStatusCodes.unprocessableEntity)
    })

    it('should return 422 for overlapping events', async () => {
      await initDb()
      const payload = {
        title: 'Finish writing API',
        startDate: '2020-12-21T05:00:00',
        endDate: '2020-12-21T08:00:00',
      }

      const res = await request(server).post('/api/events').send(payload)
      expect(res.status).toBe(httpStatusCodes.unprocessableEntity)
    })

    it('should return 200 upon successful creation of a new Event', async () => {
      await initDb()
      const payload = {
        title: 'Get some Whataburger',
        startDate: '2021-01-01T02:30:00',
        endDate: '2021-01-01T03:30:00',
      }

      const res = await request(server).post('/api/events').send(payload)
      expect(res.status).toBe(httpStatusCodes.ok)
    })
  })

  // ======================================================

  describe('GET /', () => {
    it('should return 200', async () => {
      const res = await request(server).get('/api/events').send()
      expect(res.status).toBe(httpStatusCodes.ok)
    })

    describe('With query parameters for the date interval', () => {
      it('should return 400 for not providing the "endDate" along with the "startDate"', async () => {
        const res = await request(server)
          .get('/api/events?startDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatusCodes.badRequest)
      })

      it('should return 400 for not providing the "startDate" along with the "endDate"', async () => {
        const res = await request(server)
          .get('/api/events?endDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatusCodes.badRequest)
      })

      it('should return 200 with valid query parameters in Date Format', async () => {
        const res = await request(server)
          .get('/api/events?startDate=2020-12-12&endDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatusCodes.ok)
      })

      it('should return 200 with valid query parameters in milliseconds since epoch', async () => {
        const res = await request(server)
          .get('/api/events?startDate=1608469694868&endDate=1609074494868')
          .send()
        expect(res.status).toBe(httpStatusCodes.ok)
      })
    })
  })

  // ======================================================
  // ======================================================
})
