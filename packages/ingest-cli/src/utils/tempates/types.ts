import { z } from 'zod'

export const esPutSettingsSuccessSchema = z.object({
  status: z.string(),
  value: z.object({
    acknowledged: z.boolean()
  }),
})

export const esSuccessSchema = z.object({
  acknowledged: z.boolean(),
  shards_acknowledged: z.boolean().optional(),
  index: z.string().optional().openapi({ example: 'search-group-source-timestamp' }),
})

export const esSuccessesSchema = z.array(esSuccessSchema)

export const esFailureSchema = z.object({
  error: z.string()
})

export const esFailuresSchema = z.array(
  z.object({
    error: z.string()
  })
)

export const ESResponse = z.array(z.union([esPutSettingsSuccessSchema, esFailureSchema]))
export type ESResponse = z.infer<typeof ESResponse>