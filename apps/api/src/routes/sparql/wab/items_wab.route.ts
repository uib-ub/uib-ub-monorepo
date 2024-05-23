import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { PaginationParamsSchema } from '@models'

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

export default app