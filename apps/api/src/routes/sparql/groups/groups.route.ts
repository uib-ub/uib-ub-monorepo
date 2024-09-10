import { DATA_SOURCES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { listSparqlQuery } from '@services/sparql/queries'
import jsonld, { ContextDefinition } from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'

const route = new OpenAPIHono()

const GroupsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/organization/0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
    'identifier': z.string().openapi({
      example: '0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
  })
).openapi('Groups')

export const getList = createRoute({
  method: 'get',
  path: '/groups/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GroupsSchema,
        },
      },
      description: 'Retrieve a list of groups.',
    },
  },
  description: 'Retrieve a list of groups.',
  tags: ['Sparql', 'Groups'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const query = sqb(listSparqlQuery, { type: 'crm:E74_Group', types: '<http://xmlns.com/foaf/0.1/Organization> <http://dbpedia.org/ontology/Company> <http://data.ub.uib.no/ontology/Publisher> <http://data.ub.uib.no/ontology/Family>', page: `${pageInt * limitInt}`, limit: `${limitInt}` });

  const result = await executeQuery(query, SERVICE_URL)
  const data = await jsonld.compact(result, ubbontContext as ContextDefinition)

  return c.json(cleanJsonld(data))
})

export default route