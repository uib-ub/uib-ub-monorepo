export default defineAppConfig({
  tb: {
    base: {
      systemTermbases: ["DOMENE", "LISENS"] as const,
      legacyTermbases: ["NOT", "RTT"] as const,
      specialUriTbs: ["FBK"] as const,
    },
    FBK: {
      uriPatterns: {
        bkg: "http://begrepskatalogen/begrep/",
        nav: "https://data.nav.no/begrep/",
        brreg: "http://data.brreg.no/begrep/",
        bufdir: "https://data.bufdir.no/begrep/",
        fbk: "https://concept-catalog.fellesdatakatalog.digdir.no/collections/",
        ex: "http://example.com/",
        skatt: "https://data.skatteetaten.no/begrep/#GeneratedCollection",
      },
    },
    SN: {
      termlexTermpostBaseUrl: "https://termlex.no/term",
      standardOnlineBaseUrl: "https://online.standard.no/nb/",
    },
    SNOMEDCT: {
      browserUrl(edition: string, snomedId: string): string {
        return `https://browser.ihtsdotools.org/?perspective=full&conceptId1=${snomedId}&edition=MAIN/SNOMEDCT-NO/${edition}&release=&languages=no,en`;
      },
    },
  } as const,
  ui: { wideBreakpoints: ["xl", "2xl"] },
  data: {
    matching: [
      "full",
      "full-cs",
      "full-ci",
      "startsWith-ci",
      "endsWith-ci",
      "subWord-ci",
      "contains-ci",
    ] as const,
    predicates: ["prefLabel", "altLabel", "hiddenLabel"] as const,
    semanticRelations: {
      narrower: ["qualifiedNarrower", "concept"],
      specializes: ["hasGenericConceptRelation", "hasGenericConcept"],
      isPartOf: ["hasPartitiveConceptRelation", "hasComprehensiveConcept"],
      broader: ["qualifiedBroader", "concept"],
      generalizes: ["hasGenericConceptRelation", "hasSpecificConcept"],
      hasPart: ["hasPartitiveConceptRelation", "hasPartitiveConcept"],
      related: ["isFromConceptIn", "hasToConcept"],
      seeAlso: ["qualifiedSeeAlso", "concept"],
      replaces: ["qualifiedReplaces", "concept"],
      replacedBy: ["qualifiedReplacedBy", "concept"],
    } as const,
    languageProps: {
      prefLabel: { labelPath: ["literalForm"], lcPath: ["@language"] },
      altLabel: { labelPath: ["literalForm"], lcPath: ["@language"] },
      hiddenLabel: { labelPath: ["literalForm"], lcPath: ["@language"] },
      xlDefinition: { labelPath: ["rdf:value"], lcPath: ["@language"] },
      xlScopeNote: { labelPath: ["label"], lcPath: ["@language"] },
    } as const,
  },
  search: {
    options: {
      type: { default: "search" },
      subtype: { default: "" },
      situation: { default: "" },
      term: { q: "q", default: null },
      language: { q: "ss", default: "all" },
      translate: { q: "ms", default: "none" },
      termbase: { q: "tb", default: [] },
      domain: { q: "d", default: {} },
      useDomain: { q: "ud", default: true },
      predicate: { default: ["prefLabel", "altLabel", "hiddenLabel"] as const },
      matching: {
        default: [
          ["full-cs", "full-ci"],
          ["startsWith-ci"],
          ["endsWith-ci"],
          ["subWord-ci"],
          ["contains-ci"],
        ],
      },
      limit: { default: 30 },
      offset: { default: undefined },
    },
  },
  cookie: {
    defaultOptions: { httpOnly: true, secure: true, sameSite: true },
    localeOptions: {
      httpOnly: false,
      secure: true,
      sameSite: true,
      maxAge: 60 * 60 * 24 * 100,
    },
  },
  // TODO get url and labels from data
  license: {
    "LISENS-3AAll_rights_reserved": {
      label: "All rights reserved",
      url: null,
    },
    "LISENS-3ANo_Rights_Reserved_-28CC0-29": {
      label: "CC0",
      url: "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
    },
    "LISENS-3AClarin_ID-2DEDU-2DBY-2DNC-2DNORED": {
      label: "Clarin ID-EDU-BY-NC-NORED",
      url: "https://urn.fi/urn:nbn:fi:lb-2019071724",
    },
    "LISENS-3ACC_BY_40": {
      label: "CC BY 4.0",
      url: "https://creativecommons.org/licenses/by/4.0/legalcode.no",
    },
    "LISENS-3ACC_BY-2DNC_40": {
      label: "CC BY-NC 4.0",
      url: "https://creativecommons.org/licenses/by-nc/4.0/legalcode.no",
    },
    "LISENS-3ACC_BY-2DNC-2DND_40": {
      label: "CC BY-NC-ND 4.0",
      url: "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.no",
    },
    "LISENS-3ACC_BY-2DSA_40": {
      label: "CC BY-SA 4.0",
      url: "https://creativecommons.org/licenses/by-sa/4.0/legalcode.no",
    },
    "LISENS-3ACC_BY-2DNC-2DSA_40": {
      label: "CC BY-NC-SA 4.0",
      url: "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.no",
    },
    "LISENS-3ACC_BY-2DND_40": {
      label: "CC BY-ND 4.0",
      url: "https://creativecommons.org/licenses/by-nd/4.0/legalcode.no",
    },
  },
  language: {
    dataDisplayOnly: ["en-gb", "en-us"],
    rightToleft: ["ar"],
    locale: ["nb", "nn", "en"] as const,
    order: {
      default: [
        "nb",
        "nn",
        "en",
        "en-gb",
        "en-us",
        "ar",
        "da",
        "fi",
        "fr",
        "it",
        "la",
        "pl",
        "ru",
        "so",
        "es",
        "sv",
        "ti",
        "de",
      ] as const,
      update: {
        nb: ["nb"],
        nn: ["nn", "nb"],
        en: ["en", "en-gb", "en-us", "nb", "nn"],
      },
    },
  },
  domain: { topdomains: [
    "DOMENE-3ANaturvitenskapTeknologi",
    "DOMENE-3AHumaniora",
    "DOMENE-3ASamfunnsfag",
    "DOMENE-3AHelse_og_sosial",
    "DOMENE-3AOkonomiAdministrasjon",
  ] },
  db: { esCacheKeys: ["bootstrap_data"] },
});
