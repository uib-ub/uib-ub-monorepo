import { serveStatic } from '@hono/node-server/serve-static'
import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { logger } from 'hono/logger'
import { rateLimiter } from './middlewares/rate-limiter'

// Tokens and array of HTTP methods that are considered privileged.
const readToken = 'read'
const privilegedToken = 'read+write'
const privilegedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

// Import the routes.
import es from './routes/admin/es_templates.route'
import ingest from './routes/admin/ingest.route'
import ingestManifests from './routes/admin/ingest_manifests.route'
import ingestLegacySka from './routes/admin/ingest_ska.route'
import ingestLegacyWab from './routes/admin/ingest_wab.route'
import items from './routes/items.route'
import legacyItems from './routes/legacy/items.route'
import wab from './routes/legacy/items_wab.route'
import legacyPeople from './routes/legacy/people.route'
import lookupId from './routes/lookup.route'
import ns from './routes/ns.route'
import reference from './routes/references.route'

// Create a new Hono instance. We use the OpenAPIHono class to create the app, 
// because it has the .openapi() method that we need to define the OpenAPI
// documentation. We allow trailing slashes in the routes.
const app = new OpenAPIHono({ strict: false })

// Single valid privileged token. Authenticates the request using a bearer token.
app.on(privilegedMethods, '/admin/*', async (c, next) => {
  const bearer = bearerAuth({ token: privilegedToken });
  return bearer(c, next);
})

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
    reference_url: `${url}/reference`,
    openapi_url: `${url}/openapi`,
  })
})

app.route('/items', items)
// The reference route is the OpenAPI documentation UI.
app.route('/reference', reference)
app.route('/lookup', lookupId)
app.route('/admin', es)
app.route('/legacy', wab) // This is hardcoded to the WAB dataset and must be before the dynamic "legacy marcus" route.
app.route('/legacy', legacyItems)
app.route('/legacy', legacyPeople)
app.route('/admin', ingest)
app.route('/admin', ingestManifests)
app.route('/admin', ingestLegacySka)
app.route('/admin', ingestLegacyWab)
// The ns route is for the context files.
app.route('/ns', ns)

// The OpenAPI JSON documentation will be available at /openapi.
// Must be defined after all routes, as it returns void.
app.doc31('/openapi', c => ({
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

app.get('/ns/ontology/ubbont.owl', serveStatic({ path: './statics/ontology/ubbont.owl' }))

// Show all the routes in the console.
showRoutes(app)

// Start the server on port 3009.
const port = 3009

export default {
  port,
  fetch: app.fetch,
  request: app.request, // This is needed for the tests.
}