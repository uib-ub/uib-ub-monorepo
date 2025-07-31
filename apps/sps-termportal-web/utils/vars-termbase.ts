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