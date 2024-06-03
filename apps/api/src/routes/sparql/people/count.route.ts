import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SourceParamsSchema } from '@models'
import { countPeople } from '@services/sparql/marcus/count_people.service'

const route = new OpenAPIHono()

const CountSchema = z.record(z.number()).openapi('People')

export const countPeopleRoute = createRoute({
  method: 'get',
  path: '/people/{source}/count',
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
  tags: ['Sparql'],
})

route.openapi(countPeopleRoute, async (c) => {
  const source = c.req.param('source')
  const data = await countPeople(source)
  console.log("🚀 ~ route.openapi ~ data:", data)
  return c.json(data)
})

export default route