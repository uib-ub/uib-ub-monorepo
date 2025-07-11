import { env } from '@env'
import server from '@main'

describe('Items', () => {
  test('GET /items', async () => {
    const res = await server.request('/items', {}, env)
    expect(res.status).toBe(200)
  })
  test('GET /items?limit=2', async () => {
    const res = await server.request('/items?limit=2', {}, env)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.length).toBe(2)
  })
})
