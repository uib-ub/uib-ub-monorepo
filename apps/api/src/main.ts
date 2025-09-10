import { OpenAPIHono } from '@hono/zod-openapi'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { logger } from 'hono/logger'
import { rateLimiter } from './middlewares/rate-limiter'

// Import the routes.
import { env } from './env'
import item from './routes/items/item.route'
import items from './routes/items/items.route'
import person from './routes/person/person.route'
import group from './routes/group/group.route'
import ns from './routes/ns.route'
import reference from './routes/references.route'

// Create a new Hono instance. We use the OpenAPIHono class to create the app, 
// because it has the .openapi() method that we need to define the OpenAPI
// documentation. We allow trailing slashes in the routes.
const app = new OpenAPIHono({ strict: false })

/* --------------------------------------------------------------------------
* Middlewares
* -------------------------------------------------------------------------*/
app.use('*', cors(), logger(), /* secureHeaders(), */ rateLimiter())

/* --------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------*/
app.get('/', (c) => {
  const url = c.req.url.includes('localhost')
    ? new URL(c.req.url).origin
    : new URL(c.req.url).origin.replace('http', 'https') // TODO: On vercel we get http, but we want https.

  return c.json({
    id: url,
    title: 'UiB-UB CHC API',
    description: 'The API for the UNiversity of Bergen Library Cultural Heritage Collections applications.',
    version: env.API_VERSION,
    links: {
      reference_url: `${url}/reference`,
      openapi_url: `${url}/openapi`,
    }
  })
})

app.route('/items', items)
app.route('/items', item)
app.route('/person', person)
app.route('/group', group)
// The reference route is the OpenAPI documentation UI.
app.route('/reference', reference)
// The ns route is for the context files.
app.route('/ns', ns)

// The OpenAPI JSON documentation will be available at /openapi.
// Must be defined after all routes, as it returns void.
app.doc31('/openapi', c => ({
  openapi: '3.1.0',
  info: {
    version: '0.0.1',
    title: 'UiB-UB API',
    summary: 'The API for the University of Bergen Library Cultural Heritage Collections applications.',
    description: `The API is currently in development, and is subject to change.`,
    termsOfService: `${env.DOCUMENTATION_URL}/terms`,
    contact: {
      name: 'API Support',
      url: `${env.DOCUMENTATION_URL}/support`,
      email: 'support@uib.no'
    },
  },
  servers: [
    {
      url: c.req.url.includes('localhost') ? new URL(c.req.url).origin : new URL(c.req.url).origin.replace('http', 'https'), // TODO: On vercel we get http, but we want https.
      description: 'Current environment',
    },
  ],
}))

app.get('/ns/ontology/ubbont.owl', serveStatic({ path: './static/ontology/ubbont.owl' }))

// Show all the routes in the console.
showRoutes(app)

// Start the server on port 3009.
const port = env.PORT

export default {
  port,
  fetch: app.fetch,
  request: app.request, // This is needed for the tests.
}