import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { AsParamsSchema, LegacyGroupSchema, TODO } from '@models'
import getGroupData from '@services/sparql/marcus/group_la.service'
import getItemUbbontData from '@services/sparql/marcus/item_ubbont.service'
import { HTTPException } from 'hono/http-exception'

const route = new OpenAPIHono()

const PersonSchema = z.record(z.string(), z.any()).openapi('Perosn')

export const getItem = createRoute({
  method: 'get',
  path: '/groups/{source}/{id}',
  request: {
    params: LegacyGroupSchema,
    query: AsParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a group.',
    },
  },
  description: 'Retrieve a groups.',
  tags: ['sparql'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const fetcher = as === 'la' ? getGroupData : getItemUbbontData

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'Group')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route