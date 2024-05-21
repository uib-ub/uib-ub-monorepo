import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { JsonLdDocument } from 'jsonld'
import { DATA_SOURCES } from '../../config/constants'
import { env } from '../../config/env'
import { FailureSchema, ItemParamsSchema, LegacyItemSchema, PaginationParamsSchema, SourceParamsSchema, TFailure, TODO } from '../../models'
import { countItems } from '../../services/legacy_count_items.service'
import getItemLAData from '../../services/legacy_item_la.service'
import getItemUbbontData from '../../services/legacy_item_ubbont.service'
import { getItems } from '../../services/legacy_items.service'
import { getManifestData } from '../../services/legacy_manifest.service'

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
  tags: ['legacy'],
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
  tags: ['legacy'],
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

export const getItem = createRoute({
  method: 'get',
  path: '/items/{source}/{id}',
  request: {
    params: LegacyItemSchema,
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
  },
  description: 'Retrieve a item. This is a physical or born-digital item in the library collection.',
  tags: ['legacy'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url

  const fetcher = as === 'la' ? getItemLAData : getItemUbbontData

  if (as === 'iiif') {
    try {
      const data: TODO = await getManifestData(id, SERVICE_URL, CONTEXT_IIIF, 'Manifest')
      return c.json(data);
    } catch (error) {
      // Handle the error here
      console.error(error);
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'HumanMadeObject')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
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
    404: {
      content: {
        'application/json': {
          schema: FailureSchema,
        },
      },
      description: 'Failure message.',
    },
  },
  tags: ['legacy'],
})

route.openapi(getManifest, async (c) => {
  const { id, source } = c.req.param()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/manifest/context.json`

  try {
    const data: JsonLdDocument | TFailure = await getManifestData(id, SERVICE_URL, CONTEXT, 'Manifest')
    if ('error' in data) {
      return c.json({ error: true, message: 'Not found' }, 404)
    }

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data as any);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default route