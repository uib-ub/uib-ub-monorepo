import { OpenAPIHono } from '@hono/zod-openapi'
import { bearerAuth } from 'hono/bearer-auth'
import { createBunWebSocket, serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { showRoutes } from 'hono/dev'
import { logger } from 'hono/logger'
import { rateLimiter } from './middlewares/rate-limiter'

// Tokens and array of HTTP methods that are considered privileged.
const privilegedToken = env.API_ES_WRITE_TOKEN
const privilegedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

// Import the routes.
import { env } from './config/env'
import ingestFileSets from './routes/ingest/chc/ingest_filesets.route'
import ingestItem from './routes/ingest/chc/ingest_item.route'
import ingest from './routes/ingest/chc/ingest_items.route'
import ingestManifests from './routes/ingest/chc/ingest_manifests.route'
import es from './routes/ingest/es_templates.route'
import observe from './routes/ingest/observe_templates.route'
import ingestSka from './routes/ingest/ska/ingest_ska.route'
import ingestWab from './routes/ingest/wab/ingest_wab.route'
import item from './routes/items/item.route'
import items from './routes/items/items.route'
import lookupId from './routes/lookup.route'
import ns from './routes/ns.route'
import reference from './routes/references.route'
import sparqlFileSet from './routes/sparql/file-sets/file-set.route'
import sparqlFileSets from './routes/sparql/file-sets/file-sets.route'
import sparqlCountGroups from './routes/sparql/groups/count.route'
import sparqlGroup from './routes/sparql/groups/group.route'
import sparqlGroups from './routes/sparql/groups/groups.route'
import sparqlCountItems from './routes/sparql/items/count.route'
import sparqlItem from './routes/sparql/items/item.route'
import sparqlItems from './routes/sparql/items/items.route'
import sparqlCountPeople from './routes/sparql/people/count.route'
import sparqlPeople from './routes/sparql/people/people.route'
import sparqlPerson from './routes/sparql/people/person.route'
import wab from './routes/sparql/wab/items_wab.route'

// Create a new Hono instance. We use the OpenAPIHono class to create the app, 
// because it has the .openapi() method that we need to define the OpenAPI
// documentation. We allow trailing slashes in the routes.
const app = new OpenAPIHono({ strict: false })
const { websocket } = createBunWebSocket()

// Single valid privileged token. Authenticates the request using a bearer token.
app.on(privilegedMethods, '/admin/es/*', async (c, next) => {
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
app.route('/items', item)
// The reference route is the OpenAPI documentation UI.
app.route('/reference', reference)
app.route('/lookup', lookupId)
app.route('/admin', es)
app.route('/admin', observe)
app.route('/sparql', wab) // This is hardcoded to the WAB dataset and must be before the dynamic "legacy marcus" route.
app.route('/sparql', sparqlCountItems) // All the sparql routes needs to be in a spesific order.
app.route('/sparql/file-sets', sparqlFileSets)
app.route('/sparql/file-sets', sparqlFileSet)
app.route('/sparql', sparqlItem)
app.route('/sparql', sparqlItems)
app.route('/sparql', sparqlCountPeople)
app.route('/sparql', sparqlPerson)
app.route('/sparql', sparqlPeople)
app.route('/sparql', sparqlCountGroups)
app.route('/sparql', sparqlGroup)
app.route('/sparql', sparqlGroups)
app.route('/admin/ingest', ingest)
app.route('/admin/ingest', ingestItem)
app.route('/admin/ingest', ingestFileSets)
app.route('/admin/ingest', ingestManifests)
app.route('/admin/ingest/legacy', ingestSka)
app.route('/admin/ingest/legacy', ingestWab)
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
const port = env.PORT

export default {
  port,
  fetch: app.fetch,
  request: app.request, // This is needed for the tests.
}