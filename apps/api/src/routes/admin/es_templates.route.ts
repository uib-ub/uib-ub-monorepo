import client from '@config/apis/esClient'
import { chcTemplate, manifestsTemplate } from '@config/elasticsearch/templates'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { esFailureSchema, esSuccessesSchema } from '@models'

const route = new OpenAPIHono()

export const putTemplates = createRoute({
  method: 'put',
  path: '/es/update-templates',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: esSuccessesSchema,
        },
      },
      description: '',
    },
    500: {
      content: {
        'application/json': {
          schema: esFailureSchema,
        },
      },
      description: '',
    },
  },
  description: '',
  tags: ['admin'],
})

route.openapi(putTemplates, async (c) => {
  try {
    const promises = [
      client.indices.putIndexTemplate(manifestsTemplate),
      client.indices.putIndexTemplate(chcTemplate)
    ]
    const response = await Promise.all(promises)
    return c.json(response)
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Ops, something went wrong!' }, 500);
  }
});

export default route