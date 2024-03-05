import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getItems } from '../../../services/sparql/legacy/getItems.service'
import { getItemData } from '../../../services/sparql/legacy/getItem.service'
import { IdParamsSchema, PaginationParamsSchema, TODO } from '../../../models'
import { DOMAIN, DATA_SOURCES } from '../../../config/constants'
import { countItems } from '../../../services/sparql/legacy/countItems.service'

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

export const countMarcusItems = createRoute({
  method: 'get',
  path: '/legacy/marcus/count',
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

route.openapi(countMarcusItems, async (c) => {
  const source = 'marcus'
  const data = await countItems(source)
  return c.json(data)
})

export const getList = createRoute({
  method: 'get',
  path: '/legacy/marcus',
  request: {
    query: PaginationParamsSchema,
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
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const source = 'marcus'
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${DOMAIN}/ns/ubbont/context.json`
  const data = await getItems(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})

export const getItem = createRoute({
  method: 'get',
  path: '/legacy/marcus/{id}',
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
  },
  description: 'Retrieve a item. This is a physical or born-digital item in the library collection.',
  tags: ['legacy'],
})


route.openapi(getItem, async (c) => {
  const id = c.req.param('id')
  const source = 'marcus'
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${DOMAIN}/ns/ubbont/context.json`
  try {
    const data: TODO = await getItemData(id, SERVICE_URL, CONTEXT, 'HumanMadeObject')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default route