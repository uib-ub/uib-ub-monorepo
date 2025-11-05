import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()

app.get(
  '/',
  apiReference({
    spec: {
      url: '/openapi',
    },
    pageTitle: 'UiB-UB API',
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'fetch',
    }
  }),
)

export default app
