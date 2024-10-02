import client from '@config/apis/esClient'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, TODO } from '@models'
import { toManifestTransformer } from '@transformers/manifest.transformer'

interface Document {
  [key: string]: any
}

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

function reorderDocument(doc: Document, order: string[]): Document {
  const reordered: Document = {};

  // First, add all keys from the desired order that exist in the document
  for (const key of order) {
    if (key in doc) {
      reordered[key] = doc[key];
    }
  }

  // Then, add any remaining keys from the document
  for (const key in doc) {
    if (!order.includes(key)) {
      reordered[key] = doc[key];
    }
  }

  return reordered;
}

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
    try {
      const data: TODO = await client.search({
        index: [`search-chc-fileset*`, `search-chc-items_*`],
        query: {
          match_phrase: {
            "id": id
          },
        }
      })

      if (data.hits?.total.value === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      if (data.hits?.total.value > 2) {
        return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
      }

      // if the data.hits.hits does not have an object with _index that starts with search-chc-fileset, we respond that this item has not been digitized
      if (!data.hits.hits.find((hit: any) => hit._index.startsWith('search-chc-fileset'))) {
        return c.json({ error: true, message: 'Item has not been digitized' }, 404)
      }

      return c.json(await toManifestTransformer(data.hits.hits))
    } catch (error) {
      console.error(error)
      return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
    }
  }

  try {
    const data: TODO = await client.search({
      index: `search-chc-items_*`,
      ignore_unavailable: true,
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

    return c.json(data.hits.hits.map((hit: any) => {
      return reorderDocument(hit._source as Document, desiredOrder)
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