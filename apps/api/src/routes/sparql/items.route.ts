import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { FailureSchema, LegacyItemSchema, PaginationParamsSchema, SourceParamsSchema, TFailure } from '@models'
import { countItems } from '@services/sparql/marcus/count_items.service'
import { getItems } from '@services/sparql/marcus/items.service'
import { getManifestData } from '@services/sparql/marcus/manifest.service'
import { HTTPException } from 'hono/http-exception'
import { JsonLdDocument } from 'jsonld'

const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`
const CONTEXT_IIIF = `${env.PROD_URL}/ns/manifest/context.json`

const route = new OpenAPIHono()

const ItemsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/charter/ubb-1596-10-23',
    }),
    'identifier': z.string().openapi({
      example: 'ubb-1595-07-07',
    }),
  })
).openapi('Items')

const ItemSchema = z.record(z.string()).openapi('Item')
const CountSchema = z.record(z.number()).openapi('Item')

export const countItemsRoute = createRoute({
  method: 'get',
  path: '/items/{source}/count',
  request: {
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CountSchema,
        },
      },
      description: 'Returns the number of items in the dataset.',
    },
  },
  description: 'Returns the number of items in the dataset. These are physical or born-digital items in the library collection.',
  tags: ['sparql'],
})

route.openapi(countItemsRoute, async (c) => {
  const source = c.req.param('source')
  const data = await countItems(source)
  return c.json(data)
})

export const getList = createRoute({
  method: 'get',
  path: '/items/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemsSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of items. These are physical or born-digital items in the library collection.',
  tags: ['sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`
  const data = await getItems(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})

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