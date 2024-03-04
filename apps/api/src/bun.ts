import server from './server'
import { serveStatic } from 'hono/bun'
import { showRoutes } from 'hono/dev'

server.get('/ns/ontology/ubbont.owl', serveStatic({ path: './src/libs/ontology/ubbont.owl' }))

// Show all the routes in the console.
showRoutes(server)

// Start the server on port 3000.
const port = 3000

export default {
  port: port,
  fetch: server.fetch,
} as { port: number, fetch: any }
