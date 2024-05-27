import { HalSchema } from 'src/hal/zod/hal';
import { crmP104IIsSubjectToSchema } from 'src/la/zod/linked_art';
import { z } from 'zod';

export const langLabelSchema = z.record(z.string(), z.array(z.string()));

export const rdfsLabelSchemaExtension = z.union([
  z.string(),
  langLabelSchema
]);

export const UBBClassExtension = z.object({
  _available: z.string(),
  _modified: z.string(),
  subject_to: z.lazy(() => crmP104IIsSubjectToSchema),
  _links: HalSchema,
});

export const UBBTimeSpanExtension = z.object({
  edtf: z.string(),
})