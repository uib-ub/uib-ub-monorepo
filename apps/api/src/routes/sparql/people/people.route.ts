import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { getPeople } from '@services/sparql/marcus/people.service'

const route = new OpenAPIHono()

const PeopleSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/person/110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
    'identifier': z.string().openapi({
      example: '110e6b2a-bd70-4563-a949-dc2fad72b80a',
    }),
  })
).openapi('People')


export const getList = createRoute({
  method: 'get',
  path: '/people/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PeopleSchema,
        },
      },
      description: 'Retrieve a list of items.',
    },
  },
  description: 'Retrieve a list of persons.',
  tags: ['sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const data = await getPeople(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})


export default route