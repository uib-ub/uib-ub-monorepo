import { DATA_SOURCES } from '@config/constants'
import { env } from '@config/env'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema, SourceParamsSchema } from '@models'
import { getGroups } from '@services/sparql/marcus/groups.service'

const route = new OpenAPIHono()

const GroupsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://data.ub.uib.no/instance/organization/0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
    'identifier': z.string().openapi({
      example: '0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
    }),
  })
).openapi('Groups')

export const getList = createRoute({
  method: 'get',
  path: '/groups/{source}',
  request: {
    query: PaginationParamsSchema,
    params: SourceParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GroupsSchema,
        },
      },
      description: 'Retrieve a list of groups.',
    },
  },
  description: 'Retrieve a list of groups.',
  tags: ['sparql'],
})

route.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const source = c.req.param('source')
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url
  const CONTEXT = `${env.PROD_URL}/ns/ubbont/context.json`

  const data = await getGroups(SERVICE_URL, CONTEXT, pageInt, limitInt)
  return c.json(data)
})

export default route