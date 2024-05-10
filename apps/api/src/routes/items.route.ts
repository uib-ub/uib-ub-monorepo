import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { JsonLdDocument } from 'jsonld'
import client from '../config/apis/esClient'
import { DATA_SOURCES } from '../config/constants'
import { env } from '../config/env'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, PaginationParamsSchema, TFailure, TODO } from '../models'
import { getManifestData } from '../services/legacy_manifest.service'

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
          schema: ItemSchema,
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
  const as = c.req.query('as')

  if (as === 'iiif') {
    const data: TODO = await client.search({
      index: `search-manifests-*`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data.hits?.total.value === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    if (data.hits?.total.value > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    }

    return c.json(data.hits.hits[0]._source.manifest)
  }

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

/**
 * Redirect .../:id/manifest to .../:id/manifest.json
 * because we have old links that does not use the .json extension.
 */
route.get('/:id/manifest', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/items/${id}/manifest.json`, 301)
})


/**
 * DEPRECATED
 */

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

route.openapi(getManifest, async (c) => {
  const id = c.req.param('id')
  const source = 'marcus'
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/manifest/context.json`

  try {
    const data: JsonLdDocument | TFailure = await getManifestData(id, SERVICE_URL, CONTEXT, 'Manifest')
    if ('error' in data) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data as any);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})


export default route