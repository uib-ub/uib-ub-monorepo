import { DATA_SOURCES } from '@config/constants'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { AsParamsSchema, LegacyGroupSchema } from '@models'
import { HTTPException } from 'hono/http-exception'
import { getFileSet } from './file_set.service'

const route = new OpenAPIHono()

const PersonSchema = z.record(z.string(), z.any()).openapi('Person')

export const getItem = createRoute({
  method: 'get',
  path: '/{source}/{id}',
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
  tags: ['Sparql', 'File sets'],
})


route.openapi(getItem, async (c) => {
  const { id, source } = c.req.param()
  const SERVICE_URL = DATA_SOURCES.filter(service => service.name === source)[0].url

  try {
    const data = await getFileSet(id, SERVICE_URL)

    return c.json(data);
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default route