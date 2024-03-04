import app from '../../server'

describe('Items', () => {
  test('GET /items', async () => {
    const res = await app.request('http://localhost/items')
    expect(res.status).toBe(200)
  })
  test('GET /items?limit=2', async () => {
    const res = await app.request('http://localhost/items?limit=2')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.length).toBe(2)
  })
})