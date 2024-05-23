import client from '@config/apis/esClient'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema } from '@models'

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
  path: '/',
  request: {
    query: PaginationParamsSchema,
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
  description: 'Retrieve a list of items. These are physical or born-digital items in the library collection.',
  tags: ['items'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const source = 'marcus'

  const data = await client.search({
    "index": `search-${source}-*`,
    "from": pageInt,
    "size": limitInt,
    "_source": ["_*", "identifier"],
  })
  return c.json(data.hits.hits.map((hit: any) => {
    return hit._source
  }))
})

export default route