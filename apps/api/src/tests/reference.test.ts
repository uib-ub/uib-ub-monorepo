import app from '../main'

describe('Reference', () => {
  test('GET /reference', async () => {
    const res = await app.request('http://localhost/reference')
    expect(res.status).toBe(200)
  })
})