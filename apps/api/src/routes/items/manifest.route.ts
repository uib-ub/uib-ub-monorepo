import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, IdParamsSchema, TFailure } from '@models'
import { manifestService } from '@services/sparql/marcus/manifest.service'
import { HTTPException } from 'hono/http-exception'
import { JsonLdDocument } from 'jsonld'

const route = new OpenAPIHono()

const ItemSchema = z.record(z.string()).openapi('Item')

/**
 * Redirect .../:id/manifest to .../:id/manifest.json
 * because we have old links that does not use the .json extension.
 */
route.get('/:id/manifest', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/items/${id}/manifest.json`, 301)
})


/**
 * DEPRECATED
 * Use ?as=iiif instead
 */

export const getManifest = createRoute({
  method: 'get',
  path: '/{id}/manifest.json',
  request: {
    params: IdParamsSchema,
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

route.openapi(getManifest, async (c) => {
  const id = c.req.param('id')
  const source = 'marcus'
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/manifest/context.json`

  try {
    const data: JsonLdDocument | TFailure = await manifestService(id, SERVICE_URL, CONTEXT, 'Manifest')
    if ('error' in data) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data as any);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})


export default route