import { DATA_SOURCES } from '@config/constants'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { sqb } from '@lib/sparqlQueryBuilder'
import { SourceParamsSchema } from '@models'
import { countSparqlQuery } from '@services/sparql/queries'

const route = new OpenAPIHono()

const CountSchema = z.object({
  total: z.number()
}).openapi('Count')

export const countPeopleRoute = createRoute({
  method: 'get',
  path: '/people/{source}/count',
  request: {
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CountSchema,
        },
      },
      description: 'Returns the number of items in the dataset.',
    },
  },
  description: 'Returns the number of items in the dataset. These are physical or born-digital items in the library collection.',
  tags: ['Sparql', 'People'],
})

route.openapi(countPeopleRoute, async (c) => {
  const source = c.req.param('source')
  const SERVICE = DATA_SOURCES.filter((service) => service.name === source)[0].url
  const query = sqb(countSparqlQuery, { types: '<http://xmlns.com/foaf/0.1/Person> <http://data.ub.uib.no/ontology/Cataloguer>' })
  const url = `${SERVICE}${encodeURIComponent(query)}&output=json`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return c.json({ total: parseInt(data.results.bindings[0].total.value) })
  } catch (error) {
    console.error(error);
    throw error;
  }
})

export default route