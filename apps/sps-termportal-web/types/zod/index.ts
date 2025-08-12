import * as z from "zod";

const appConfig = useAppConfig();

// language
export const LangCode = z.literal(appConfig.language.order.default);
export const LocaleLangCode = z.literal(appConfig.language.locale);

// termbase
export const SpecialUriTermbase = z.literal(appConfig.tb.base.specialUriTbs);
export const SystemTermbase = z.literal(appConfig.tb.base.systemTermbases);
export const LegacyTermbase = z.literal(appConfig.tb.base.legacyTermbases);
export const ConfiguredTermbase = z.literal(
  Object.keys(appConfig.tb).filter(key => key !== "base"),
);
export const TermbaseId = z.union([
  ConfiguredTermbase,
  SystemTermbase,
  LegacyTermbase,
  SpecialUriTermbase,
  z.string(),
]);

// license
export const LicensePageId = z.literal(
  Object.keys(appConfig.license) as Array<keyof typeof appConfig.license>,
);

const DomainSchema: z.ZodType<Record<string, string | null>> = z.lazy(() =>
  z.record(z.string(), z.object({
    subdomains: z.union([
      z.null(),
      z.lazy(() => DomainSchema),
    ]),
  })),
);

export const BootstrapData = z.object({
  lalo: z.object({
    nb: z.record(z.string(), z.string()),
    nn: z.record(z.string(), z.string()),
    en: z.record(z.string(), z.string()),
  }),
  termbase: z.record(
    z.string(),
    z.object({
      language: z.array(LangCode),
      versionEdition: z.string().optional(),
      versionNotesLink: z.string().optional(),
    })),
  domain: DomainSchema,
});

export const Termbase = z.object({
  identifier: TermbaseId,
  publisher: z.object({
    identifier: z.string().optional(),
    label: z
      .object({ "@language": LocaleLangCode, "@value": z.string() })
      .optional(),
  }),
  contactPoint: z.object({
    hasEmail: z.string().optional(),
    hasTelephone: z.string().optional(),
  }),
  language: z.array(LangCode),
  license: z.object({ "@id": LicensePageId }),
  opprinneligSpraak: LangCode.optional(),
  description: z.object({
    nb: z.string().optional(),
    nn: z.string().optional(),
    en: z.string().optional(),
  }),
  modified: z.object({ "type": z.string(), "@value": z.string() }),
});
