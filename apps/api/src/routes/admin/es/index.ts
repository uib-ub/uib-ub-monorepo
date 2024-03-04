import { z, OpenAPIHono, createRoute } from '@hono/zod-openapi'
import client from '../../../libs/esClient'
import { choTemplate } from '../../../libs/elasticsearch/templates'
import { esFailureSchema, esSuccessSchema, indexParamsSchema } from '../../../schemas/shared'

const app = new OpenAPIHono()

export const putTemplate = createRoute({
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

app.openapi(putTemplate, async (c) => {
  try {
    const response = await client.indices.putIndexTemplate(choTemplate);

    return c.json(response);
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ error: 'Internal Server Error' });
  }
});

export const createIndex = createRoute({
  method: 'put',
  path: '/es/create-index/:index',
  request: {
    params: indexParamsSchema,
  },
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

app.openapi(createIndex, async (c) => {
  const index = c.req.param('index')
  try {
    const response = await client.indices.create({ index: `${index}-${Date.now()}` });
    return c.json(response)
  } catch (error) {
    // Handle the error here
    console.error(error);
    c.status(500)
    return c.json({ error: 'Internal Server Error' });
  }
})

export default app