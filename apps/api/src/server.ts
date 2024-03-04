import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { rateLimiter } from './middlewares/rate-limiter'
// Tokens and array of HTTP methods that are considered privileged.
const readToken = 'read'
const privilegedToken = 'read+write'
const privilegedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

// Import the routes.
import items from './routes/items'
import reference from './routes/reference'
import lookupId from './routes/lookup'
import es from './routes/admin/es'
import marcus from './routes/admin/legacy/marcus'
import wab from './routes/admin/legacy/wab'
import ska from './routes/admin/legacy/ska'
import ingestMarcus from './routes/admin/ingest'
import ns from './routes/ns'

// Create a new Hono instance. We use the OpenAPIHono class to create the app, 
// because it has the .openapi() method that we need to define the OpenAPI
// documentation. We allow trailing slashes in the routes.
const server = new OpenAPIHono({ strict: false })

// Single valid privileged token. Authenticates the request using a bearer token.
server.on(privilegedMethods, '/admin/*', async (c, next) => {
  const bearer = bearerAuth({ token: privilegedToken });
  return bearer(c, next);
})

/* --------------------------------------------------------------------------
* Middlewares
* -------------------------------------------------------------------------*/
server.use('*', cors(), logger(), /* secureHeaders(), */ rateLimiter())

/* --------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------*/
server.get('/', (c) => {
  const url = c.req.url.includes('localhost')
    ? new URL(c.req.url).origin
    : new URL(c.req.url).origin.replace('http', 'https') // TODO: On vercel we get http, but we want https.

  return c.json({
    reference_url: `${url}/reference`,
    openapi_url: `${url}/openapi`,
    items_url: `${url}/items{?page,limit}`,
  })
})
server.route('/items', items)
// The reference route is the OpenAPI documentation UI.
server.route('/reference', reference)
server.route('/lookup', lookupId)
server.route('/admin', es)
server.route('/admin', marcus)
server.route('/admin', ingestMarcus)
server.route('/admin', ska)
//server.route('/admin', ingestSka)
server.route('/admin', wab)
//server.route('/admin', ingestWab)
// The ns route is for the context files.
server.route('/ns', ns)

// The OpenAPI JSON documentation will be available at /openapi.
// Must be defined after all routes, as it returns void.
server.doc31('/openapi', c => ({
  openapi: '3.1.0',
  info: {
    version: '0.0.1',
    title: 'UiB-UB API',
    summary: 'The API for the UiB-UB applications.',
    description: `The API is currently in development, and is subject to change. The API is based on the [Hono](//hono.dev) framework.`,
    termsOfService: 'https://docs-ub.vercel.app/terms/',
    contact: {
      name: 'API Support',
      url: 'https://docs-ub.vercel.app/support',
      email: 'support@uib.no'
    },
  },
  tags: [
    {
      name: 'items',
      description: 'Items',
    },
  ],
  servers: [
    {
      url: c.req.url.includes('localhost') ? new URL(c.req.url).origin : new URL(c.req.url).origin.replace('http', 'https'), // TODO: On vercel we get http, but we want https.
      description: 'Current environment',
    },
  ],
}))

export default server