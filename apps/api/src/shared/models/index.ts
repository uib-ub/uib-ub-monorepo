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
  source: z.enum(['spes'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'spes',
    })
})

export const LegacyItemSchema = z.object({
  source: z.enum(['spes'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'spes',
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

export const LegacyPersonSchema = z.object({
  source: z.enum(['spes'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'spes',
    }),
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: 'f4c9914c-fb05-4d02-8054-f3c2ddb64afe',
    })
})

export const LegacyGroupSchema = z.object({
  source: z.enum(['spes'])
    .openapi({
      param: {
        name: 'source',
        in: 'path',
        required: true,
      },
      example: 'spes',
    }),
  id: z.string()
    .openapi({
      param: {
        name: 'id',
        in: 'path',
        required: true,
      },
      example: '0f4d957a-5476-4e88-b2b6-71a06c1ecf9c',
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

export const AsParamsSchema = z.object({
  as: z
    .enum(['la', 'ubbont'])
    .optional()
    .default('la')
    .openapi({
      param: {
        name: 'as',
        in: 'query',
      },
      example: 'la',
    }),
})

export type TODO = unknown

