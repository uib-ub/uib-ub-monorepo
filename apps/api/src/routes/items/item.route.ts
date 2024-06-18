import client from '@config/apis/esClient'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, TODO } from '@models'

const route = new OpenAPIHono()

const ItemSchema = z.record(z.string()).openapi('Item')

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
  tags: ['Items'],
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
    return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
  }
})

/**
 * Redirect .../:id/manifest to .../:id/manifest.json
 * because we have old links that does not use the .json extension.
 */
route.get('/:id/manifest', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/items/${id}?as=iiif`, 301)
})


/**
 * Redirect .../:id/manifest to .../:id/manifest.json
 * because we have old links that does not use the .json extension.
 */
route.get('/:id/manifest.json', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/items/${id}?as=iiif`, 301)
})


export default route