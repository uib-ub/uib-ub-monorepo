import server from '@main'

describe('OpenAPI', () => {
  test('GET /openapi', async () => {
    const res = await server.request('/openapi')
    expect(res.status).toBe(200)
  })
})