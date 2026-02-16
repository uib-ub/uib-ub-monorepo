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
      example: { labelPath: [], lcPath: ["@language"] },
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
      limit: { default: 50 },
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
  tmp: {
    concept: {
      nb: "kunnskapsenhet som er dannet gjennom en unik kombinasjon av kjennetegn",
      nn: "kunnskapseining som er danna gjennom ein unik kombinasjon av kjenneteikn",
      en: "unit of knowledge created by a unique combination of characteristics" },
    term: {
      nb: "betegnelse for et allmennbegrep som tilhører et fagområde",
      nn: "nemning for eit allmennomgrep som høyrer til eit fagområde",
      en: "verbal designation of a general concept in a specific subject field" },
    domain: {
      nb: "spesialisert kunnskapsområde",
      nn: "spesialisert kunnskapsområde",
      en: "field of special knowledge" },
    termpost: {
      nb: "del av en strukturert samling terminologiske data som gjelder ett enkelt begrep",
      nn: "del av ei strukturert samling terminologiske data som gjeld eitt einskilt omgrep",
      en: "part of a terminological data collection which contains the terminological data related to one concept" },
    termbase: {
      nb: "database som inneholder terminologiske data",
      nn: "database som inneheld terminologiske data",
      en: "database containing terminological data" },
    prefLabel: {
      nb: "term som blir sett på som den best egnede for et bestemt begrep",
      nn: "term som blir sett på som den best eigna for eit visst omgrep",
      en: "term rated according to the scale of the term acceptability rating as the primary term for a given concept" },
    altLabel: {
      nb: "term som blir sett på som egnet for et bestemt begrep, og som blir brukt ved siden av en anbefalt term",
      nn: "term som blir sett på som eigna for eit visst omgrep, og som blir brukt ved sida av ein tilrådd term",
      en: "term rated according to the scale of the term acceptability rating as a synonym for a preferred term" },
    hiddenLabel: {
      nb: "term som blir sett på som uegnet for et bestemt begrep",
      nn: "term som blir sett på som ueigna for eit visst omgrep",
      en: "term rated according to the scale of the term acceptability rating as undesired" },
    obsoleteTerm: {
      nb: "term som ikke lenger er i praktisk bruk",
      nn: "term som ikkje lenger er i praktisk bruk",
      en: "term which is no longer in common use" },
    multiWordTerm: {
      nb: "term som består av to eller flere atskilte ord",
      nn: "term som omfattar to eller fleire åtskilde ord",
      en: "term consisting of two or more words" },
    complexTerm: {
      nb: "term som består av ett ord satt sammen av to eller flere ord",
      nn: "term som er eitt ord sett saman av to eller fleire ord",
      en: "term containing two or more roots" },
    acceptabilityRating: {
      nb: "",
      nn: "",
      en: "" },
    definition: {
      nb: "beskrivelse som avgrenser begrepet mot beslektede begreper",
      nn: "beskriving som avgrensar omgrepet mot nærståande omgrep",
      en: "representation of a concept by a descriptive statement which serves to differentiate it from related concepts" },
    note: {
      nb: "tilleggsinformasjon om begrepet eller termene i en termpost",
      nn: "tilleggsinformasjon om omgrepet eller termane i ein termpost",
      en: "statement which provides further information on any part of a terminological entry" },
    kontext: {
      nb: "tekstutdrag som viser hvordan en betegnelse brukes",
      nn: "tekstutdrag som viser korleis ei nemning blir brukt",
      en: "text which illustrates a concept or the use of a designation" },
    relation: {
      nb: "relasjon mellom begreper basert på deres vesentlige kjennetegn",
      nn: "relasjon mellom omgrep basert på dei vesentlege kjenneteikna deira",
      en: "relation between concepts" },
    genericRelation: {
      nb: "begrepsrelasjon der det ene begrepets begrepsinnhold omfatter det andre begrepets begrepsinnhold og i tillegg ytterligere ett eller flere atskillende kjennetegn",
      nn: "omgrepsrelasjon der omgrepsinnhaldet til det eine omgrepet omfattar omgrepsinnhaldet til det andre omgrepet og i tillegg ytterlegare eitt eller fleire åtskiljande kjenneteikn",
      en: "relation between two concepts where the intension of one of the concepts includes that of the other concept and at least one additional delimiting characteristic" },
    partitiveRelation: {
      nb: "begrepsrelasjon der det ene begrepet gjelder en helhet og det andre en del av denne helheten",
      nn: "omgrepsrelasjon der det eine omgrepet gjeld ein heilskap og det andre ein del av denne heilskapen",
      en: "relation between two concepts where one of the concepts constitutes the whole and the other concept a part of that whole" },
    relatedRelation: {
      nb: "begrepsrelasjon som bygger på en bestemt ikke-hierarkisk, tematisk sammenheng mellom begrepenes referenter",
      nn: "omgrepsrelasjon som byggjer på ein viss ikkje-hierarkisk, tematisk samanheng mellom referentane til omgrepa",
      en: "relation between two concepts having a non-hierarchical thematic connection by virtue of experience" },
    equivalence: {
      nb: "relasjon mellom betegnelser som i ulike språk står for samme begrep",
      nn: "relasjon mellom nemningar som i ulike språk står for same omgrep",
      en: "relation between designations in different languages representing the same concept" },
  },
});
