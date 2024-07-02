import client from '@config/apis/esClient'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema } from '@models'

const route = new OpenAPIHono()

const ItemsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'ubb-1596-10-23',
    }),
    '_label': z.record(z.string(), z.array(z.string().openapi({ example: 'Manuscript' }))),
    '_available': z.date().optional().openapi({
      example: '2016-06-08T00:00:00.000Z',
    }),
    '_modified': z.date().optional().openapi({
      example: '2021-02-12T14:03:43.000Z',
    }),
  })
).openapi('Items')


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
          schema: ItemsSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of items. These are physical or born-digital items in the library collection.',
  tags: ['Items'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  const data = await client.search({
    index: `search-chc`,
    ignore_unavailable: true,
    from: pageInt,
    size: limitInt,
    // @TODO: Add sorting
    sort: [
      {
        "id.keyword": {
          "order": "asc"
        }
      },
    ],
    _source: ["_label", "id"],
  })

  return c.json(
    data.hits.hits.map((hit: any) => {
      return {
        ...hit._source,
        id: `${env.API_URL}/items/${hit._source.id}`,
      }
    })
  )
})

export default route