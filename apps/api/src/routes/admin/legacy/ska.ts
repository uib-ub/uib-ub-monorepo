import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getItems } from '../../../services/sparql/legacy/getItems'
import { getItemData } from '../../../services/sparql/legacy/getItem'
import { IdParamsSchema, PaginationParamsSchema } from '../../../schemas/shared'
import { DOMAIN } from '../../../libs/constants'

const app = new OpenAPIHono()

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

export const getList = createRoute({
  method: 'get',
  path: '/legacy/ska',
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

app.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const CONTEXT = `${DOMAIN}/ns/ubbont/context.json`
  const data = await getItems('https://sparql.ub.uib.no/skeivtarkiv?query=', CONTEXT, pageInt, limitInt)
  return c.json(data)
})

export const getItem = createRoute({
  method: 'get',
  path: '/legacy/ska/{id}',
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

app.openapi(getItem, async (c) => {
  const id = c.req.param('id')
  let data: any = await getItemData(id, 'ska', `https://api-ub.vercel.app/ns/ubbont/context.json`, 'HumanMadeObject')

  // Change id as this did not work in the query
  data.id = `${data.identifier}`
  // We assume all @none language tags are really norwegian
  data = JSON.parse(JSON.stringify(data).replaceAll('"none":', '"no":'))

  // @TODO: Remove this when we have dct:modified on all items in the dataset
  data.modified = {
    "type": "xsd:date",
    "@value": data.modified ?? "2020-01-01T00:00:00"
  }
  // @TODO: figure out how to type the openapi response with JSONLD
  return c.json(data as any);
})

export default app