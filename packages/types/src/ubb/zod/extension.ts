import { crmE55TypeSchema, crmE7ActivitySchema, crmE8AcquisitionSchema, crmP104IIsSubjectToSchema, crmP50HasCurrentKeeperSchema } from 'src/la/zod/linked_art';
import { z } from 'zod';

export const langLabelSchema = z.record(z.string(), z.array(z.string()));

export const rdfsLabelSchemaExtension = z.union([
  z.string(),
  langLabelSchema
]);

export const UBBClassExtension = z.object({
  _available: z.string().optional(),
  _modified: z.string(),
  subject_to: z.lazy(() => crmP104IIsSubjectToSchema),
  current_keeper: z.lazy(() => crmP50HasCurrentKeeperSchema.optional()),
  was_used_for: z.lazy(() => z.array(crmE7ActivitySchema)).optional(),
  changed_ownership_through: z.lazy(() => z.array(crmE8AcquisitionSchema)).optional(),
  // _links: HalSchema,
});

export const UBBTimeSpanExtension = z.object({
  edtf: z.string(),
})

export const UBBRightExtension = z.object({
  inherit_from: z.lazy(() => crmE55TypeSchema).optional(),
})