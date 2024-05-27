import { z } from 'zod'

export const HalSchema = z.object({
  self:
    z.object({
      href:
        z.string()
    }),
  curies:
    z.array(z.object({
      name: z.string(),
      href: z.string(),
      templated: z.boolean()
    }))
}) 