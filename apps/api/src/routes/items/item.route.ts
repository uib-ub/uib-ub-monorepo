import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema } from '@shared/models'
import { constructIIIFStructure } from '@shared/mappers/iiif/constructIIIFStructure'
import { reorderDocument, sqb, useFrame } from 'utils'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { itemQuery } from './item-query'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'
import { JsonLdObj } from 'jsonld/jsonld-spec'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const ItemSchema = z.any().openapi('Item')

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

  if (as === 'ubbont') {
    try {
      const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(itemQuery, { id }))}&output=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      const data = await response.json();
      // Check if data is empty by checking if it's falsy, has no keys, or is an empty object
      if (!data || Object.keys(data).length === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'HumanMadeObject' });
      // Cast to JsonLdObj which allows @context property
      (framed as JsonLdObj)['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"]
      return c.json(framed as z.infer<typeof ItemSchema>);
    } catch (error) {
      throw new Error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (as === 'iiif') {
    try {
      const data = await client.search({
        index: [`search-chc`],
        query: {
          match_phrase: {
            "id": id
          },
        }
      })


      if (data.hits?.total === 0 || (typeof data?.hits?.total === 'object' && data?.hits?.total?.value === 0)) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const fileset = data?.hits?.hits?.find((hit) => hit._index?.startsWith('search-chc-fileset'))?._source as { data?: unknown }

      if (!fileset) {
        return c.json({ error: true, message: 'Item has not been digitized' }, 404)
      }

      const item = data?.hits?.hits?.find((hit) => hit._index?.startsWith('search-chc-items'))?._source

      if (!item) {
        return c.json({ error: true, message: 'Item has not been catalogued' }, 404)
      }

      const manifest = constructIIIFStructure(item, fileset)
      return c.json(manifest)
    } catch (error) {
      console.error(error)
      return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
    }
  }

  try {
    const data = await client.search({
      index: `search-chc`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data?.hits?.total === 0 || (typeof data?.hits?.total === 'object' && data?.hits?.total?.value === 0)) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    const item = data?.hits?.hits?.find((hit) => hit._index?.startsWith('search-chc-items'))?._source as JsonLdObj

    if (!item) {
      return c.json({ error: true, message: 'Item has not been catalogued' }, 404)
    }

    if (Array.isArray(item) && item.length > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    }

    // Rewrite _id to use the id from the URL parameter
    const itemWithNewId = {
      ...item,
      id: `${env.API_BASE_URL}/items/${String(item.id)}`
    }

    return c.json(reorderDocument(itemWithNewId, desiredOrder))
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