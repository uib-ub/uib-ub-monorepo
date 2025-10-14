import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema } from '@shared/models'
import { normalizeJsonLdToArray, reorderDocument, sqb, useFrame } from 'utils'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { groupQuery } from './group-query'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'
import { JsonLdObj } from 'jsonld/jsonld-spec'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const GroupSchema = z.any().openapi('Group')

export const GroupParamsSchema = z.object({
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

export const GroupIdParamsSchema = z.object({
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: '0d52fbb1-4cdd-4fae-8e5f-cc680f6764fe',
    })
})

export const getGroup = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: GroupIdParamsSchema,
    query: GroupParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GroupSchema,
        },
      },
      description: 'Retrieve a group.',
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
  tags: ['Group'],
})

route.openapi(getGroup, async (c) => {
  const id = c.req.param('id')
  const as = c.req.query('as')

  if (as === 'ubbont') {
    try {
      const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(groupQuery, { id }))}&output=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const normalizedData = normalizeJsonLdToArray(data)
      const matchingItem = normalizedData.find((item) => item['dct:identifier'] === id);

      if (!matchingItem) {
        return c.json({ error: true, message: 'Group not found in graph' }, 404);
      }

      const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

      const framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'Group', id: url });
      (framed as JsonLdObj)['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"];
      return c.json(reorderDocument(framed, desiredOrder) as z.infer<typeof GroupSchema>);
    } catch (error) {
      return c.json({ error: true, message: `Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}` }, 404)
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

    const item = data.hits.hits[0]._source as JsonLdObj

    const itemWithNewId = {
      ...item,
      id: `${env.API_BASE_URL}/items/${item.id}`
    }

    return c.json(reorderDocument(itemWithNewId, desiredOrder));
  } catch (error) {
    console.error(error)
    return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
  }
})

export default route