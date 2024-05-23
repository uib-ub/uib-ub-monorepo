import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { ItemParamsSchema, LegacyItemSchema, TODO } from '@models'
import getItemLAData from '@services/sparql/marcus/item_la.service'
import getItemUbbontData from '@services/sparql/marcus/item_ubbont.service'
import { getManifestData } from '@services/sparql/marcus/manifest.service'
import { HTTPException } from 'hono/http-exception'
import { humanMadeObjectSchema } from 'types/src/la/zod/object'

const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`
const CONTEXT_IIIF = `${env.PROD_URL}/ns/manifest/context.json`

const route = new OpenAPIHono()

const ItemSchema = z.record(z.string()).openapi('Item')

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
  tags: ['sparql'],
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
      throw new HTTPException(500, { message: 'Internal Server Error' })
    }
  }

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'HumanMadeObject')
    const parsed = humanMadeObjectSchema.safeParse(data);
    if (parsed.success === false) {
      console.log("🚀 ~ route.openapi ~ t:", parsed.error.issues)
    }
    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route