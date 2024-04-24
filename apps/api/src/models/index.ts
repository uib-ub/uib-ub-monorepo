import { z } from '@hono/zod-openapi'

export type TFailure = {
  error: boolean
  message: unknown
}

export const indexParamsSchema = z.object({
  index: z.string()
    .openapi({
      param: {
        name: 'index',
        in: 'path',
        required: true,
      },
      example: 'search-chc-marcus',
    }),
})

export const esSuccessSchema = z.object({
  acknowledged: z.boolean(),
  shards_acknowledged: z.boolean().optional(),
  index: z.string().optional().openapi({ example: 'search-group-source-timestamp' }),
}).openapi('ES')

export const esSuccessesSchema = z.array(
  z.object({
    acknowledged: z.boolean(),
    shards_acknowledged: z.boolean().optional(),
    index: z.string().optional().openapi({ example: 'search-group-source-timestamp' }),
  })
).openapi('ES')


export const esFailureSchema = z.object({
  error: z.string()
}).openapi('ES')

export const esFailuresSchema = z.array(
  z.object({
    error: z.string()
  })
).openapi('ES')

export const FailureSchema = z.object({
  error: z.boolean(),
  message: z.string()
})

export const IdParamsSchema = z.object({
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: 'ubb-bros-00001',
    })
})

export const SourceParamsSchema = z.object({
  source: z.enum(['marcus', 'ska'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'marcus',
    })
})

export const LegacyItemSchema = z.object({
  source: z.enum(['marcus', 'ska'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'marcus',
    }),
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: 'ubb-bros-00001',
    })
})

export const IdQuerySchema = z.object({
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'query',
        required: true,
      },
      example: 'ubb-bros-00001',
    })
})

export const PaginationParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .default('0')
    .openapi({
      param: {
        name: 'page',
        in: 'query',
      },
      example: '2',
    }),
  limit: z
    .string()
    .optional()
    .default('10')
    .openapi({
      param: {
        name: 'limit',
        in: 'query',
      },
      example: '10',
    }),
})

export const ItemParamsSchema = z.object({
  as: z
    .enum(['iiif', 'la', 'ubbont'])
    .optional()
    .default('la')
    .openapi({
      param: {
        name: 'as',
        in: 'query',
      },
      example: 'iiif',
    }),
})

export type TODO = any

export type TBaseMetadata = {
  identifier: string,
  context: string[],
  newId: string,
  originalId: string,
  productionTimespan: any,
  _label: any,
}