import client from '@shared/clients/es-client'
import { env } from '@env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, ItemParamsSchema } from '@shared/models'
import { constructIIIFStructure } from '@shared/mappers/iiif/constructIIIFStructure'
import { reorderDocument, sqb, useFrame } from 'utils'
import { endpointUrl } from '@shared/clients/sparql-chc-client'
import { itemQuery } from './object-query'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { ContextDefinition } from 'jsonld'
import { JsonLdObj } from 'jsonld/jsonld-spec'

const route = new OpenAPIHono()

const desiredOrder: string[] = ['@context', 'id', 'type', '_label', '_available', '_modified', 'identified_by']

const ObjectSchema = z.any().openapi('Object')

export const getObject = createRoute({
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
          schema: ObjectSchema,
        },
      },
      description: 'Retrieve a object.',
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
  tags: ['Object'],
})

route.openapi(getObject, async (c) => {
  const id = c.req.param('id')
  const as = c.req.query('as')

  if (as === 'ubbont') {
    try {
      const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(itemQuery, { id }))}&output=json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch object: ${response.statusText}`);
      }
      const data = await response.json();
      // Check if data is empty by checking if it's falsy, has no keys, or is an empty object
      if (!data || Object.keys(data).length === 0) {
        return c.json({ error: true, message: 'Not found' }, 404)
      }

      const framed = await useFrame({ data, context: ubbontContext as ContextDefinition, type: 'HumanMadeObject' });
      // Cast to JsonLdObj which allows @context property
      (framed as JsonLdObj)['@context'] = ["https://api.ub.uib.no/ns/ubbont/context.json"]
      return c.json(framed as z.infer<typeof ObjectSchema>);
    } catch (error) {
      throw new Error(`Error fetching object ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        return c.json({ error: true, message: 'Object has not been digitized' }, 404)
      }

      const object = data?.hits?.hits?.find((hit) => hit._index?.startsWith('search-chc-items'))?._source

      if (!object) {
        return c.json({ error: true, message: 'Object has not been catalogued' }, 404)
      }

      const manifest = constructIIIFStructure(object, fileset)
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

    const object = data?.hits?.hits?.find((hit) => hit._index?.startsWith('search-chc-items'))?._source as JsonLdObj

    if (!object) {
      return c.json({ error: true, message: 'Object has not been catalogued' }, 404)
    }

    if (Array.isArray(object) && object.length > 1) {
      return c.json({ error: true, message: 'Ops, found duplicates!' }, 404)
    }

    // Rewrite _id to use the id from the URL parameter
    const itemWithNewId = {
      ...object,
      id: `${env.API_BASE_URL}/object/${String(object.id)}`
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
  return c.redirect(`/object/${id}?as=iiif`, 301)
})


/**
 * Redirect .../:id/manifest to .../:id/manifest.json
 * because we have old links that does not use the .json extension.
 */
route.get('/:id/manifest.json', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/object/${id}?as=iiif`, 301)
})


export default route