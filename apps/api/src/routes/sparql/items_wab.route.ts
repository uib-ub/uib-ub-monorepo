import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { IdQuerySchema, PaginationParamsSchema } from '@models'
import { getWabBemerkung } from '@services/sparql/wab/get-wab-bemerkung'
import { listWabBemerkung } from '@services/sparql/wab/list-wab-bemerkung'

const app = new OpenAPIHono()

const ItemsSchema = z.array(
  z.object({
    'id': z.string().openapi({
      example: 'http://purl.org/wittgensteinsource/ont/instances/W-Ms-119',
    }),
    'url': z.string().openapi({
      example: 'http://purl.org/wittgensteinsource/ont/instances/W-Ms-119',
    }),
  })
).openapi('Items')

const ItemSchema = z.record(z.string()).openapi('Item')

export const getList = createRoute({
  method: 'get',
  path: '/wab/list',
  request: {
    query: PaginationParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ItemsSchema,
        },
      },
      description: 'Retrieve a list of Bemerkung, DiaryEntry, Correspondence, Recollection, LectureNotes, MS or TS.',
    },
  },
  description: 'Retrieve a list of Bemerkung, DiaryEntry, Correspondence, Recollection, LectureNotes, MS or TS. The items is part of the Wittgenstein dataset. The identifier is a URL, so you must pass it as a query parameter.',
  tags: ['sparql'],
})

app.openapi(getList, async (c) => {
  const { page = '0', limit = '10' } = c.req.query()
  const data = await listWabBemerkung(parseInt(page), parseInt(limit))
  return c.json(data)
})

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
  tags: ['sparql'],
})

app.openapi(getItem, async (c) => {
  const { id } = c.req.query()
  const response = await getWabBemerkung(id)
  return c.json(response)
})

export default app