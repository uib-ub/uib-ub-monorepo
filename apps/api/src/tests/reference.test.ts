import server from '@main'

describe('Reference', () => {
  test('GET /reference', async () => {
    const res = await server.request('/reference')
    expect(res.status).toBe(200)
  })
})