import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import client from '../config/apis/esClient'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, PaginationParamsSchema, TODO } from '../models'

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

const PersonSchema = z.record(z.string()).openapi('Item')

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

export const getItem = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: IdParamsSchema,
    query: ItemParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a item.',
    },
    404: {
      content: {
        'application/json': {
          schema: FailureSchema,
        },
      },
      description: 'Failure message.',
    },
  },
  tags: ['items'],
})

route.openapi(getItem, async (c) => {
  const id = c.req.param('id')

  try {
    const data: TODO = await client.search({
      index: `search-chc`,
      // TODO: This should use term: identifier.keyword to ensure exact match
      query: {
        match_phrase: {
          "identifier": id
        },
      }
    })

    if (data.hits?.total.value === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    if (data.hits?.total.value > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    }

    return c.json(data.hits.hits.map((hit: any) => {
      return Object.keys(hit._source)
        .sort()
        .reduce((acc, key) => ({
          ...acc, [key]: hit._source[key]
        }), {})
    })[0])
  } catch (error) {
    console.error(error)
    return c.json({ error: true, message: "Ups, something went wrong!" }, 500)
  }
})

export default route