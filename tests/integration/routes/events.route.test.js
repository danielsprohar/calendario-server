const request = require('supertest')
const httpStatus = require('../../../constants/http-status-codes')
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
      expect(res.status).toBe(httpStatus.unprocessableEntity)
    })

    it('should return 422 for an invalid date interval', async () => {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24)
      const payload = {
        title: 'Hello world',
        startDate: today,
        endDate: yesterday,
      }

      const res = await request(server).post('/api/events').send(payload)
      expect(res.status).toBe(httpStatus.unprocessableEntity)
    })

    it('should return 422 for overlapping events', async () => {
      await initDb()
      const payload = {
        title: 'Finish writing API',
        startDate: '2020-12-21T05:00:00',
        endDate: '2020-12-21T08:00:00',
      }

      const res = await request(server).post('/api/events').send(payload)
      expect(res.status).toBe(httpStatus.unprocessableEntity)
    })

    it('should return 200 upon successful creation of a new Event', async () => {
      await initDb()
      const payload = {
        title: 'Get some Whataburger',
        startDate: '2021-01-01T02:30:00',
        endDate: '2021-01-01T02:30:00',
      }

      const res = await request(server).post('/api/events').send(payload)
      expect(res.status).toBe(httpStatus.ok)
    })
  })

  // ======================================================

  describe('GET /', () => {
    it('should return 200', async () => {
      const res = await request(server).get('/api/events').send()
      expect(res.status).toBe(httpStatus.ok)
    })

    describe('With query parameters for the date interval', () => {
      it('should return 400 for not providing the "endDate" along with the "startDate"', async () => {
        const res = await request(server)
          .get('/api/events?startDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatus.badRequest)
      })

      it('should return 400 for not providing the "startDate" along with the "endDate"', async () => {
        const res = await request(server)
          .get('/api/events?endDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatus.badRequest)
      })

      it('should return 200 with valid query parameters in Date Format', async () => {
        const res = await request(server)
          .get('/api/events?startDate=2020-12-12&endDate=2020-12-12')
          .send()
        expect(res.status).toBe(httpStatus.ok)
      })

      it('should return 200 with valid query parameters in milliseconds since epoch', async () => {
        const res = await request(server)
          .get('/api/events?startDate=1608469694868&endDate=1609074494868')
          .send()
        expect(res.status).toBe(httpStatus.ok)
      })
    })
  })

  // ======================================================

  describe('GET /:id', () => {
    it('should return 404 if the event does not exist', async () => {
      const res = await request(server)
        .get('/api/events/6f5a6af4-6af8-4296-acd9-b428419aa0ae')
        .send()
      expect(res.status).toBe(httpStatus.notFound)
    })

    it('should return 200', async () => {
      await initDb()
      const events = await Event.findAll({
        order: ['startDate'],
        limit: 1,
        offset: 0,
      })

      const id = events[0].id
      const res = await request(server).get(`/api/events/${id}`).send()
      expect(res.status).toBe(httpStatus.ok)
    })

    describe('Route parameters (entity id)', () => {
      it('should return 400 for an invalid UUIDv4', async () => {
        const res = await request(server).get('/api/events/hello-there').send()
        expect(res.status).toBe(httpStatus.badRequest)
      })

      it('should return 400 for using an integer instead of a UUIDv4', async () => {
        const res = await request(server).get('/api/events/1').send()
        expect(res.status).toBe(httpStatus.badRequest)
      })
    })
  })

  // ======================================================

  describe('PUT /:id', () => {
    it('should return 404 if the event does not exist', async () => {
      const res = await request(server)
        .put('/api/events/6f5a6af4-6af8-4296-acd9-b428419aa0ae')
        .send()
      expect(res.status).toBe(httpStatus.notFound)
    })

    it('should return 422 for an invalid request body', async () => {
      await initDb()
      const event = await getFirstEvent()

      const res = await request(server)
        .put(`/api/events/${event.id}`)
        .send({ id: event.id })
      expect(res.status).toBe(httpStatus.unprocessableEntity)
    })

    it('should return 204 upon updating the given event', async () => {
      const now = new Date()
      const event = await Event.create({
        title: 'Test the "Update an Event" endpoint',
        startDate: now,
        endDate: now,
      })

      const updatedTitle = 'Test the "Create an Event" endpoint'
      const url = `/api/events/${event.id}`
      const payload = {
        title: updatedTitle,
      }

      const res = await request(server).put(url).send(payload)
      expect(res.status).toBe(httpStatus.noContent)
    })

    describe('Route parameters (entity id)', () => {
      it('should return 400 for an invalid UUIDv4', async () => {
        const res = await request(server).put('/api/events/hello-there').send()
        expect(res.status).toBe(httpStatus.badRequest)
      })

      it('should return 400 for using an integer instead of a UUIDv4', async () => {
        const res = await request(server).put('/api/events/1').send()
        expect(res.status).toBe(httpStatus.badRequest)
      })
    })
  })

  // ======================================================

  describe('DELETE /:id', () => {
    it('should return 404 if the event does not exist', async () => {
      const res = await request(server)
        .delete('/api/events/6f5a6af4-6af8-4296-acd9-b428419aa0ae')
        .send()
      expect(res.status).toBe(httpStatus.notFound)
    })

    it('should return 204 upon successful deletion of the given Event', async () => {
      await initDb()
      const event = await getFirstEvent()

      const res = await request(server).delete(`/api/events/${event.id}`).send()
      expect(res.status).toBe(httpStatus.noContent)
    })

    describe('Route parameters (entity id)', () => {
      it('should return 400 for an invalid UUIDv4', async () => {
        const res = await request(server)
          .delete('/api/events/hello-there')
          .send()
        expect(res.status).toBe(httpStatus.badRequest)
      })

      it('should return 400 for using an integer instead of a UUIDv4', async () => {
        const res = await request(server).delete('/api/events/1').send()
        expect(res.status).toBe(httpStatus.badRequest)
      })
    })
  })

  // ======================================================
  // Facilitators
  // ======================================================

  async function getFirstEvent() {
    const events = await Event.findAll({
      order: ['startDate'],
      limit: 1,
      offset: 0,
    })
    return events[0]
  }
})
