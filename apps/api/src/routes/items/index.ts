import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { AsParamsSchema, IdParamsSchema, PaginationParamsSchema, TODO } from '../../schemas/shared'
import { DOMAIN, dataSources } from '../../libs/constants'
import client from '../../libs/esClient'
import { getManifestData } from '../../services/sparql/legacy/getManifest'

const app = new OpenAPIHono()

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

const ItemSchema = z.record(z.string()).openapi('Item')

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
  tags: ['items'],
})

app.openapi(getList, async (c) => {
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
    query: AsParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Retrieve a item.',
    },
  },
  tags: ['items'],
})

app.openapi(getItem, async (c) => {
  const id = c.req.param('id')
  const as = c.req.query('as')
  const source = 'marcus'

  if (as === 'iiif') {
    const SERVICE_URL = dataSources.filter(service => service.name === 'marcus')[0].url
    const CONTEXT = `${DOMAIN}/ns/manifest/context.json`

    try {
      const data: TODO = await getManifestData(id, SERVICE_URL, CONTEXT, 'Manifest')

      // @TODO: figure out how to type the openapi response with JSONLD
      return c.json(data as any);
    } catch (error) {
      // Handle the error here
      console.error(error);
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  const data: TODO = await client.search({
    "index": `search-${source}-*`,
    query: {
      match: {
        identifier: id
      }
    }
  })
  return c.json(data.hits.hits.map((hit: any) => {
    return Object.keys(hit._source)
      .sort()
      .reduce((acc, key) => ({
        ...acc, [key]: hit._source[key]
      }), {})
  })[0])
})

export const getManifest = createRoute({
  method: 'get',
  path: '/{id}/manifest.json',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Retrieve a item.',
    },
  },
  tags: ['items'],
})

app.openapi(getManifest, async (c) => {
  const id = c.req.param('id')
  const source = 'marcus'
  const SERVICE_URL = dataSources.filter(service => service.name === source)[0].url
  const CONTEXT = `${DOMAIN}/ns/manifest/context.json`

  try {
    const data: any = await getManifestData(id, SERVICE_URL, CONTEXT, 'Manifest')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data as any);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

/* 

app.openapi(getItem, async (c) => {
  const id = c.req.param('id')
  const source = 'cho'

  const data = await client.search({
    "index": `${source}-manifests-*`,
    query: {
      match: {
        identifier: id
      }
    }
  })
  return c.json(data.hits.hits.map((hit: any) => {
    return hit._source
  }))
})

*/
export default app