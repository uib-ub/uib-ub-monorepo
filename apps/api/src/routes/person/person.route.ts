import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema } from '@shared/models'
import { reorderDocument, sqb, useFrame } from 'utils'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { personQuery } from './person-query'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { type JsonLdObj, type Context } from 'jsonld/jsonld-spec'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const PersonSchema = z.any().openapi('Person')

export const PersonParamsSchema = z.object({
  as: z
    .enum(['la', 'ubbont'])
    .optional()
    .default('la')
    .openapi({
      param: {
        name: 'as',
        in: 'query',
      },
      example: 'la',
    }),
})

export const PersonIdParamsSchema = z.object({
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: 'b5aac2c6-141d-4a61-b580-63902d54b4da',
    })
})

export const getPerson = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: PersonIdParamsSchema,
    query: PersonParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a person.',
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
  tags: ['Person'],
})

route.openapi(getPerson, async (c) => {
  const id = c.req.param('id')
  const as = c.req.query('as')

  if (as === 'ubbont') {
    try {
      const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(personQuery, { id }))}&output=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      const data = await response.json();
      // Check if data is empty by checking if it's falsy, has no keys, or is an empty object
      if (!data || Object.keys(data).length === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      // Find the matching item in the graph
      const matchingItem = data['@graph']?.find((item: JsonLdObj) => item['dct:identifier'] === id);
      if (!matchingItem) {
        return c.json({ error: true, message: 'Person not found in graph' }, 404);
      }

      const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

      const framed = await useFrame({ data, context: ubbontContext as Context, type: 'Person', id: url });
      // Cast to JsonLdObj which allows @context property
      (framed as JsonLdObj)['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"];
      return c.json(reorderDocument(framed, desiredOrder) as z.infer<typeof PersonSchema>);
    } catch (error) {
      throw new Error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    /* const item = data.hits.hits.find((hit: any) => hit._index.startsWith('search-chc-items'))._source
 
    if (item > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    } */

    const item = data.hits.hits[0]._source as JsonLdObj

    // Rewrite _id to use a safe string id before templating
    const itemRec = item as Record<string, unknown>
    let itemId = ''
    if (typeof itemRec.id === 'string') {
      itemId = itemRec.id
    } else {
      const atId = itemRec['@id']
      if (typeof atId === 'string') {
        itemId = atId
      }
    }

    const itemWithNewId = {
      ...item,
      id: `${env.API_BASE_URL}/items/${itemId}`
    }

    return c.json(reorderDocument(itemWithNewId, desiredOrder) as z.infer<typeof PersonSchema>);
  } catch (error) {
    console.error(error)
    return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
  }
})


export default route