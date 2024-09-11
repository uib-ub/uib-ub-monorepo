import { DATA_SOURCES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { listItemsSparqlQuery } from '@services/sparql/queries'
import jsonld, { ContextDefinition } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'

const route = new OpenAPIHono()

const ItemsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/charter/ubb-1596-10-23',
    }),
    'identifier': z.string().openapi({
      example: 'ubb-1595-07-07',
    }),
  })
).openapi('Items')

export const getList = createRoute({
  method: 'get',
  path: '/items/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemsSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of items. These are physical or born-digital items in the library collection.',
  tags: ['Sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const query = sqb(listItemsSparqlQuery, { limit: limitInt, page: pageInt * limitInt })

  const result = await executeQuery(query, SERVICE_URL)
  const data = await jsonld.compact(result, ubbontContext as ContextDefinition)

  return c.json(cleanJsonld(data))
})

export default route