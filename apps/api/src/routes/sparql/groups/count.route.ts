import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SourceParamsSchema } from '@models'
import { countGroups } from '@services/sparql/marcus/count_groups.service'

const route = new OpenAPIHono()

const CountSchema = z.record(z.number()).openapi('Item')

export const countGroupsRoute = createRoute({
  method: 'get',
  path: '/groups/{source}/count',
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
      description: 'Returns the number of groups in the dataset.',
    },
  },
  description: 'Returns the number of groups in the dataset. These are groups connected to material in the library collection.',
  tags: ['sparql'],
})

route.openapi(countGroupsRoute, async (c) => {
  const source = c.req.param('source')
  const data = await countGroups(source)
  return c.json(data)
})

export default route