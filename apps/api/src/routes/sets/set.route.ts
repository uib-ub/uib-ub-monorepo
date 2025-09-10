import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, TODO } from '@shared/models'
import { normalizeJsonLdToArray, reorderDocument, sqb, useFrame } from 'utils'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { setQuery } from './set-query'
import { constructIIIFCollection } from '@shared/mappers/iiif/constructIIIFCollection'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const SetSchema = z.record(z.string()).openapi('Set')

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
      const matchingItem = normalizedData.find((item: any) => item['dct:identifier'] === id);

      if (!matchingItem) {
        return c.json({ error: true, message: 'Group not found in graph' }, 404);
      }

      const url = matchingItem['@id'].replace('j.0:', 'http://data.ub.uib.no/');

      let framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'Group', id: url });
      framed['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"];
      return c.json(reorderDocument(framed, desiredOrder));
    } catch (error) {
      throw new Error(`Error fetching item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (as === 'iiif') {
    try {
      // First query: Get the collection
      const setData: TODO = await client.search({
        index: [`search-chc-sets*`],
        query: {
          term: {
            "id.keyword": id
          },
        }
      })

      if (setData.hits?.total.value === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const set = setData?.hits?.hits?.[0]?._source

      if (!set) {
        return c.json({ error: true, message: 'Item has not been catalogued' }, 404)
      }

      // Second query: Get items that reference this collection
      const itemsData: TODO = await client.search({
        index: [`search-chc`],
        query: {
          bool: {
            should: [
              {
                nested: {
                  path: "member_of",
                  query: {
                    term: {
                      "member_of.id.keyword": `${env.PROD_URL}/sets/${id}`
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
      const items = itemsData?.hits?.hits?.map((hit: any) => hit._source) ?? undefined
      const itemsCount = itemsData?.hits?.total?.value ?? 1

      const setWithItems = {
        ...set,
        items
      }

      const manifest = constructIIIFCollection(setWithItems)
      // Add total item count to response header
      c.header('X-Total-Count', itemsCount.toString())
      return c.body(
        JSON.stringify(manifest),
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
    const data: TODO = await client.search<any>({
      index: `search-chc-sets*`,
      query: {
        match_phrase: {
          "id": id
        },
      }
    })

    if (data?.hits?.total?.value === 0) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    const item = data.hits.hits[0]._source

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


export default route