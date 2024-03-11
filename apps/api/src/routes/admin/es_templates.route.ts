import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import client from '../../config/apis/esClient'
import { chcTemplate } from '../../config/elasticsearch/templates'
import { esFailureSchema, esSuccessSchema, indexParamsSchema } from '../../models'

const route = new OpenAPIHono()

export const putTemplates = createRoute({
  method: 'put',
  path: '/es/update-templates',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: esSuccessSchema,
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
    const response = await client.indices.putIndexTemplate(chcTemplate);

    return c.json(response);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default route