import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { IdQuerySchema } from '@models'
import { getWabBemerkung } from '@services/sparql/wab/get-wab-bemerkung'

const app = new OpenAPIHono()

const ItemSchema = z.record(z.string(), z.any()).openapi('Item')

export const getItem = createRoute({
  method: 'get',
  path: '/wab',
  request: {
    query: IdQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
      description: 'Retrieve a Bemerkung, DiaryEntry, Correspondence, Recollection, LectureNotes, MS or TS.',
    },
  },
  description: 'Retrieve a Bemerkung, DiaryEntry, Correspondence, Recollection, LectureNotes, MS or TS from the Wittgenstein dataset.',
  tags: ['Sparql'],
})

app.openapi(getItem, async (c) => {
  const { id } = c.req.query()
  const response = await getWabBemerkung(id)
  return c.json(response)
})

export default app