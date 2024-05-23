import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'

const app = new OpenAPIHono()

app.get(
  '/',
  apiReference({
    cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.22.44',
    spec: {
      url: '/openapi',
    },
    pageTitle: 'UiB-UB API',
  }),
)

export default app
