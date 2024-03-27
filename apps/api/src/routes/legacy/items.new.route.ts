import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getItemData } from '../../services/legacy_item_new.service'
import { LegacyItemSchema } from '../../models'
import { DOMAIN, DATA_SOURCES } from '../../config/constants'

const route = new OpenAPIHono()

const ItemSchema = z.record(z.string()).openapi('Item')

export const getItem = createRoute({
  method: 'get',
  path: '/new/{source}/{id}',
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
  },
  description: 'Retrieve a item. This is a physical or born-digital item in the library collection.',
  tags: ['legacy'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${DOMAIN}/ns/ubbont/context.json`

  try {
    const data = await getItemData(id, SERVICE_URL, CONTEXT, 'HumanMadeObject')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: true, message: 'Woops' }, 500)
  }
})

export default route