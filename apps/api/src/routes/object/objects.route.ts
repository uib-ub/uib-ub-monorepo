import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema } from '@shared/models'

const route = new OpenAPIHono()

const ObjectsSchema = z.array(
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
).openapi('Object')


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
          schema: ObjectsSchema,
        },
      },
      description: 'Retrieve a list of objects.',
    },
  },
  description: 'Retrieve a list of objects. These are physical or born-digital objects in the library collection.',
  tags: ['Object'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  const data = await client.search({
    index: `search-chc-items*`,
    ignore_unavailable: true,
    from: pageInt * limitInt, // Multiply page by limit to get correct offset
    size: limitInt,
    // @TODO: Add sorting
    sort: [
      {
        "id.keyword": {
          "order": "asc"
        }
      },
    ],
    _source: ["_label", "id", "type", "_available", "_modified"],
  })

  return c.json(
    data.hits.hits.map((hit: any) => {
      const sourceRec = hit._source as Record<string, unknown>
      let srcId = ''
      if (typeof sourceRec.id === 'string') {
        srcId = sourceRec.id
      } else if (typeof sourceRec['@id'] === 'string') {
        srcId = sourceRec['@id']
      }
      return {
        ...hit._source,
        identifier: sourceRec.id,
        id: `${env.API_BASE_URL}/object/${srcId}`,
      }
    })
  )
})

export default route