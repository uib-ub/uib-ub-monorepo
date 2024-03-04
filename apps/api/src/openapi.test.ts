import app from './server'

describe('OpenAPI', () => {
  test('GET /openapi', async () => {
    const res = await app.request('http://localhost/openapi')
    expect(res.status).toBe(200)
  })
})