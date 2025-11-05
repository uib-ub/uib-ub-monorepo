import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema } from '@shared/models'
import { normalizeJsonLdToArray, reorderDocument, sqb, useFrame } from 'utils'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { setQuery } from './set-query'
import { constructIIIFCollection } from '@shared/mappers/iiif/constructIIIFCollection'
import { SearchHit, SearchResponseBody } from '@elastic/elasticsearch/lib/api/types'
import { JsonLdObj } from 'jsonld/jsonld-spec'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const SetSchema = z.any().openapi('Set')

export const SetParamsSchema = z.object({
  as: z
    .enum(['iiif', 'la', 'ubbont'])
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

export const SetIdParamsSchema = z.object({
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: 'fd217222-8193-4122-bd03-57fd68565fb5',
    })
})

export const getSet = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: SetIdParamsSchema,
    query: SetParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SetSchema,
        },
      },
      description: 'Retrieve a set.',
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
  tags: ['Set'],
})

route.openapi(getSet, async (c) => {
  const id = c.req.param('id')
  const as = c.req.query('as')

  if (as === 'ubbont') {
    try {
      const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(setQuery, { id }))}&output=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }
      const data = await response.json();

      // Check if data is empty by checking if it's falsy, has no keys, or is an empty object
      if (!data || Object.keys(data).length === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const normalizedData = normalizeJsonLdToArray(data)
      // Find the matching item in the graph
      const matchingItem = normalizedData.find((item: Record<string, unknown>) => item['dct:identifier'] === id);

      if (!matchingItem) {
        return c.json({ error: true, message: 'Not found' }, 404);
      }

      const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

      const framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'Set', id: url });
      framed['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"];
      return c.json(reorderDocument(framed, desiredOrder) as z.infer<typeof SetSchema>);
    } catch (error) {
      console.error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
    }
  }

  if (as === 'iiif') {
    try {
      // First query: Get the collection
      const setData: SearchResponseBody = await client.search({
        index: [`search-chc-sets*`],
        query: {
          term: {
            "id.keyword": id
          },
        }
      })

      if (setData?.hits?.total === 0 || (typeof setData?.hits?.total === 'object' && setData?.hits?.total?.value === 0)) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const set = setData?.hits?.hits?.[0]?._source

      if (!set) {
        return c.json({ error: true, message: 'Not found.' }, 404)
      }

      // Second query: Get items that reference this collection
      const itemsData: SearchResponseBody = await client.search({
        index: [`search-chc`],
        query: {
          bool: {
            should: [
              {
                nested: {
                  path: "member_of",
                  query: {
                    wildcard: {
                      "member_of.id.keyword": `*${id}`
                    }
                  }
                }
              },
            ]
          }
        },
        sort: [
          /* {
            "type.keyword": "desc"
          }, */
          {
            "id.keyword": "asc"
          }
        ],
        _source: ["id", "type", "_label", "representation"],
        size: 10000
      })

      // Add the items to the collection data
      const items = itemsData?.hits?.hits?.map((hit: SearchHit) => hit._source) ?? undefined
      // Needed to check the number of hits, as the value can be a number or an object. Typescript doesn't like this.
      const itemsTotal = itemsData?.hits?.total
      const itemsCount = typeof itemsTotal === 'number' ? itemsTotal : itemsTotal?.value ?? 1

      const setWithItems = {
        ...set,
        items
      }

      const manifest = constructIIIFCollection(setWithItems)
      // Add total item count to response header
      c.header('X-Total-Count', itemsCount.toString())
      return c.json(
        manifest as z.infer<typeof SetSchema>,
        200,
        {
          'Content-Type': 'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"'
        }
      )
    } catch (error) {
      console.error(error)
      return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
    }
  }

  // Default to la
  try {
    const data: SearchResponseBody = await client.search({
      index: `search-chc-sets*`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data?.hits?.total === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    const item = data.hits.hits[0]._source as JsonLdObj

    // Rewrite _id to use the id from the URL parameter
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
      id: `${env.API_BASE_URL}/sets/${itemId}`
    }

    return c.json(reorderDocument(itemWithNewId, desiredOrder) as z.infer<typeof SetSchema>)
  } catch (error) {
    console.error(error)
    return c.json({ error: true, message: "Ups, something went wrong!" }, 404)
  }
})


export default route