import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, LegacyItemSchema, TFailure } from '@models'
import { getManifestData } from '@services/sparql/marcus/manifest.service'
import { HTTPException } from 'hono/http-exception'
import { JsonLdDocument } from 'jsonld'

const route = new OpenAPIHono()

const ItemSchema = z.record(z.string(), z.any()).openapi('Manifest')

export const getManifest = createRoute({
  method: 'get',
  path: '/items/{source}/{id}/manifest.json',
  request: {
    params: LegacyItemSchema,
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
    500: {
      content: {
        'application/json': {
          schema: FailureSchema,
        },
      },
      description: 'Failure message.',
    },
  },
  tags: ['sparql'],
})

route.openapi(getManifest, async (c) => {
  const { id, source } = c.req.param()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/manifest/context.json`

  try {
    const data: JsonLdDocument | TFailure = await getManifestData(id, SERVICE_URL, CONTEXT, 'Manifest')
    if ('error' in data) {
      throw new HTTPException(500, { message: 'Internal Server Error' })
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