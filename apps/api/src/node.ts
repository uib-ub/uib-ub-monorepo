import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import { serveStatic } from '@hono/node-server/serve-static'

import server from './server'

server.get('/ns/ontology/ubbont.owl', serveStatic({ path: './src/libs/ontology/ubbont.owl' }))

// Show all the routes in the console.
showRoutes(server)

// Start the server on port 3000.
const port = 3000

serve({
  fetch: server.fetch,
  port
})