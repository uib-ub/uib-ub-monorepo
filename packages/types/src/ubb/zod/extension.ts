import { crmE55TypeSchema, crmE74GroupSchema, crmE7ActivitySchema, crmP104IIsSubjectToSchema, crmP7TookPlaceAtSchema, e21PersonSchema } from '@/la/zod/linked_art';
import { z } from "@hono/zod-openapi";

export const langLabelSchema = z.record(z.string(), z.array(z.string()));

export const UBBClassExtension = z.object({
  _available: z.string().optional(),
  _modified: z.string(),
  // _links: HalSchema,
});

export const UBBHumanMadeObjectExtension = z.object({
  subject_to: z.lazy(() => crmP104IIsSubjectToSchema),
  current_permanent_location: z.lazy(() => crmP7TookPlaceAtSchema).optional(),
  was_used_for: z.lazy(() => z.array(crmE7ActivitySchema)).optional(),
});

export const UBBPersonExtension = z.object({
  partner_in: z.lazy(() => z.array(UBBSocialRelationshipExtension)).optional(),
  participated_in: z.lazy(() => z.array(crmE7ActivitySchema)).optional(),
  current_or_former_member_of: z.lazy(() => z.array(crmE74GroupSchema)).optional(),
});

export const UBBTimeSpanExtension = z.object({
  edtf: z.string(),
})

export const UBBRightExtension = z.object({
  inherit_from: z.lazy(() => crmE55TypeSchema).optional(),
})

export const UBBPlaceExtension = z.object({
  defined_by_geojson: z.string().optional(),
})

export const UBBSocialRelationshipExtension = z.object({
  type: z.string(),
  _label: z.string(),
  classified_as: z.lazy(() => z.array(crmE55TypeSchema)),
  involves_partner: z.lazy(() => z.array(e21PersonSchema)).optional(),
})