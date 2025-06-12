import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema, TODO } from '@shared/models'
import { constructIIIFStructure } from '@shared/mappers/iiif/constructIIIFStructure'
import { reorderDocument, sqb, useFrame } from 'utils'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { itemQuery } from './item-query'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

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

      let framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'HumanMadeObject' });
      framed['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"]
      return c.json(framed);
    } catch (error) {
      throw new Error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

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

      const fileset = data?.hits?.hits?.find((hit: any) => hit._index.startsWith('search-chc-fileset'))?._source?.data

      if (!fileset) {
        return c.json({ error: true, message: 'Item has not been digitized' }, 404)
      }

      const item = data?.hits?.hits?.find((hit: any) => hit._index.startsWith('search-chc-items'))?._source

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
    const data: TODO = await client.search<any>({
      index: `search-chc`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data?.hits?.total?.value === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    const item = data?.hits?.hits?.find((hit: any) => hit._index.startsWith('search-chc-items'))?._source

    if (!item) {
      return c.json({ error: true, message: 'Item has not been catalogued' }, 404)
    }

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