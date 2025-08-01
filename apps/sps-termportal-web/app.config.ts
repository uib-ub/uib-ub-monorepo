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
  },
  search: {},
  cookie: {
    defaultOptions: { httpOnly: true, secure: true, sameSite: true },
    localeOptions: {
      httpOnly: false,
      secure: true,
      sameSite: true,
      maxAge: 60 * 60 * 24 * 100,
    },
  },
});
