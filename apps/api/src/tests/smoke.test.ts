import server from '../main'

/**
 * Performs a smoke test.
 * 
 * This test is an implicit test to check if the server is working.
 */
test('Smoke test', async () => {
  await server.request('/')
  expect(true).toBe(true)
})
