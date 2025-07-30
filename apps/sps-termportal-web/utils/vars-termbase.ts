export const termbaseUriPatterns: {
  [key: TermbaseId]: { [key in CollectionUriPatternKey]: string };
} = {
  FBK: {
    bkg: "http://begrepskatalogen/begrep/",
    nav: "https://data.nav.no/begrep/",
    brreg: "http://data.brreg.no/begrep/",
    bufdir: "https://data.bufdir.no/begrep/",
    fbk: "https://concept-catalog.fellesdatakatalog.digdir.no/collections/",
    ex: "http://example.com/",
    skatt: "https://data.skatteetaten.no/begrep/#GeneratedCollection",
  },
};

export const termbaseConfig = {
  base: {
    systemTermbases: ["DOMENE", "LISENS"],
    legacyTermbases: ["NOT", "RTT"],
  },
  SN: {
    termlexTermpostBaseUrl: "https://termlex.no/term",
    standardOnlineBaseUrl: "https://online.standard.no/nb/",
  },
  SNOMEDCT: {
    browserUrl(edition: string, snomedId: string) {
      return `https://browser.ihtsdotools.org/?perspective=full&conceptId1=${snomedId}&edition=MAIN/SNOMEDCT-NO/${edition}&release=&languages=no,en`;
    },
  },
};
