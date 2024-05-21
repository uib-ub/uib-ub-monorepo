import { serve } from '@hono/node-server'
import app from './main'

// Start the server on port 3009.
const port = 3009

const server = serve({
  port,
  fetch: app.fetch,
})

process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  server.close();
});