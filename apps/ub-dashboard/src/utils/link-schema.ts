import { z } from 'zod';

export const linkSchema = z.object({
  path: z.string().min(1),
  originalURL: z.string().url(),
  qr: z.string(),
  domain: z.string(),
  views: z.number().int().nonnegative().default(0),
  redirectType: z.number().int().default(302),
  created: z.string().datetime(),
  modified: z.string().datetime(),
  title: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  expiresAt: z.string().datetime().nullish(),
  expiresURL: z.string().url().nullish(),
  utmSource: z.string().nullish(),
  utmMedium: z.string().nullish(),
  utmCampaign: z.string().nullish(),
  utmTerm: z.string().nullish(),
  utmContent: z.string().nullish(),
});

export type Link = z.infer<typeof linkSchema>;
