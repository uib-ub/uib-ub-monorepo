import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, TODO } from '@shared/models'
import { toManifestTransformer } from '@shared/transformers/manifest.transformer'

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
        index: [`search-chc`],
        query: {
          match_phrase: {
            "id": id
          },
        }
      })


      if (data.hits?.total.value === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const fileset = data.hits.hits.find((hit: any) => hit._index.startsWith('search-chc-fileset'))._source.data

      if (!fileset) {
        return c.json({ error: true, message: 'Item has not been digitized' }, 404)
      }

      const item = data.hits.hits.find((hit: any) => hit._index.startsWith('search-chc-items'))._source

      return c.json(await toManifestTransformer(item, fileset))
    } catch (error) {
      console.error(error)
      return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
    }
  }

  try {
    const data: TODO = await client.search({
      index: `search-chc`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data.hits?.total.value === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    const item = data.hits.hits.find((hit: any) => hit._index.startsWith('search-chc-items'))._source

    if (item > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    }

    // Rewrite _id to use the id from the URL parameter
    const itemWithNewId = {
      ...item,
      id: `${env.PROD_URL}/items/${item.id}`
    }

    return c.json(reorderDocument(itemWithNewId as Document, desiredOrder))
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