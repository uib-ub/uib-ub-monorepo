import { DATA_SOURCES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { listSubClassOfSparqlQuery } from '@services/sparql/queries'
import jsonld, { ContextDefinition } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'

const route = new OpenAPIHono()

const PeopleSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/person/110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
    'identifier': z.string().openapi({
      example: '110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
  })
).openapi('People')


export const getList = createRoute({
  method: 'get',
  path: '/people/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PeopleSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of persons.',
  tags: ['Sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url

  const query = sqb(listSubClassOfSparqlQuery, { type: 'foaf:Person', types: 'foaf:Person', page: `${pageInt * limitInt}`, limit: `${limitInt}` });

  const result = await executeQuery(query, SERVICE_URL)
  const data = await jsonld.compact(result, ubbontContext as ContextDefinition)

  return c.json(cleanJsonld(data))
})


export default route