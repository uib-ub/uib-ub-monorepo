import app from '../../server'

describe('Reference', () => {
  test('GET /reference', async () => {
    const res = await app.request('http://localhost/reference')
    expect(res.status).toBe(200)
  })
})