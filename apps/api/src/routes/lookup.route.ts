import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { lookupService } from '../services/lookupId.service'
import { IdParamsSchema } from '../models'

/**
 * Lookup schema
 * Stupid attempt to isolate the API from the source of the data. With sparql
 * you can use the same query to ASK if the id exists, but for rest you need to know
 * id there is an "exists" endpoint. If not to use some custom logic to check if the
 * id exists and supply the correst API endpoint to get metadata on the object.
 * Then you need to decide what data you want to return.
 */
const LookupSchema = z.object({
  'name': z.string().openapi({
    example: 'ska',
  }),
  'lookupUrl': z.string().optional().openapi({
    example: 'https://sparql.ub.uib.no/skeivtarkiv/query?query=',
  }),
  'url': z.string().openapi({
    example: 'https://sparql.ub.uib.no/skeivtarkiv/query?query=',
  }),
  'type': z.string().openapi({
    example: 'sparql|rest',
  })
}).openapi('Lookup')

const app = new OpenAPIHono()

export const resolveId = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LookupSchema,
        },
      },
      description: 'Service name, url and type this ID is available at.',
    },
  },
  description: 'Lookup ID and find service url and type this objects is available at.',
  tags: ['lookup'],
})

app.openapi(resolveId, async (c) => {
  const id = c.req.param('id')
  const data = await lookupService(id)
  return c.json(data)
})

export default app