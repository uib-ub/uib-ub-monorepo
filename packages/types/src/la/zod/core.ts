import { z } from "zod";

export const linkedArtSchema = z.literal(
  "https://linked.art/ns/v1/linked-art.json",
);

export const linkedArtWithExtensionsSchema = z.array(z.string());

export const jSONLDContextSchema = z.union([
  linkedArtSchema,
  linkedArtWithExtensionsSchema,
]);

export const theSubjectUriSchema = z.string();

export const genericString = z.string();

export const crmHumanMadeObjectTypeSchema = z.literal("HumanMadeObject");
export const nameTypeSchema = z.literal("Name");
export const typeTypeSchema = z.literal("Type");
export const textTypeSchema = z.literal("LinguisticObject");
export const informationTypeSchema = z.literal("InformationObject")
export const digitalObjectTypeSchema = z.literal("DigitalObject");
export const identifierTypeSchema = z.literal("Identifier");
export const attributionAssignmentTypeSchema = z.literal("AttributeAssignment");
export const placeTypeSchema = z.literal("Place");
export const timespanTypeSchema = z.literal("TimeSpan");
export const dimensionTypeSchema = z.literal("Dimension");
export const personTypeSchema = z.literal("Person");
export const groupTypeSchema = z.literal("Group");
export const visualItemTypeSchema = z.literal("VisualItem");
export const activityTypeSchema = z.literal("Activity");
export const productionSchema = z.literal("Production");
export const destructionTypeSchema = z.literal("Destruction");
export const partRemovalTypeSchema = z.literal("PartRemoval");
export const encounterTypeSchema = z.literal("Encounter");
export const rightTypeSchema = z.literal("Right");
export const setTypeSchema = z.literal("Set");
export const eventTypeSchema = z.literal("Event");
export const periodTypeSchema = z.literal("Period");
export const birthTypeSchema = z.literal("Birth");
export const deathTypeSchema = z.literal("Death");
export const formationTypeSchema = z.literal("Formation");
export const dissolutionTypeSchema = z.literal("Dissolution");
export const measurementUnitTypeSchema = z.literal("MeasurementUnit");

export const allTypesSchema = z.union([
  crmHumanMadeObjectTypeSchema,
  personTypeSchema,
  groupTypeSchema,
  visualItemTypeSchema,
  textTypeSchema,
  placeTypeSchema,
  digitalObjectTypeSchema,
  typeTypeSchema,
  activityTypeSchema,
  setTypeSchema,
  eventTypeSchema,
  periodTypeSchema,
]);

export const rdfTypeSchema = z.string();
export const langLabelSchema = z.record(z.string(), z.array(z.string()));
export const rdfsLabelSchema = genericString.or(langLabelSchema); // Not compliant with Linked Art, as it expects a string (export const rdfsLabelSchema = z.string();)
export const crmP190HasSymbolicContentSchema = z.string();
export const dcFormatSchema = z.string();

export const crmP82ABeginOfTheBeginSchema = z.string();
export const crmP81AEndOfTheBeginSchema = z.string();
export const crmP81BBeginOfTheEndSchema = z.string();
export const crmP82BEndOfTheEndSchema = z.string();
export const crmP90HasValueSchema = z.number();
export const crmP90AHasLowerValueLimitSchema = z.number();
export const crmP90AHasUpperValueLimitSchema = z.number();
export const crmP177AssignedPropertyTypeSchema = z.string();

export const genericReference = z.object({
  id: theSubjectUriSchema,
  type: rdfTypeSchema.and(allTypesSchema),
  _label: rdfsLabelSchema.optional(),
});

export const genericReferencesSchema = z.array(genericReference);
