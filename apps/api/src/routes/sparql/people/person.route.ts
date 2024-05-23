import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { AsParamsSchema, LegacyPersonSchema, TODO } from '@models'
import getItemUbbontData from '@services/sparql/marcus/item_ubbont.service'
import getPersonData from '@services/sparql/marcus/person_la.service'
import { HTTPException } from 'hono/http-exception'

const route = new OpenAPIHono()

const PersonSchema = z.record(z.string()).openapi('Person')

export const getItem = createRoute({
  method: 'get',
  path: '/people/{source}/{id}',
  request: {
    params: LegacyPersonSchema,
    query: AsParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PersonSchema,
        },
      },
      description: 'Retrieve a person.',
    },
  },
  description: 'Retrieve a person.',
  tags: ['sparql'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const { as = 'la' } = c.req.query()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const fetcher = as === 'la' ? getPersonData : getItemUbbontData

  try {
    const data: TODO = await fetcher(id, SERVICE_URL, CONTEXT, 'Person')

    // @TODO: figure out how to type the openapi response with JSONLD
    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route