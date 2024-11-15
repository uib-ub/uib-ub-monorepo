export type TermbaseId = string;

export type Domains =
  | "DOMENE-3AHumaniora"
  | "DOMENE-3ANaturvitenskapTeknologi"
  | "DOMENE-3ASamfunnsfag"
  | "DOMENE-3AOkonomiAdministrasjon";

type CollectionUriPatternKey =
  | "bkg"
  | "nav"
  | "brreg"
  | "bufdir"
  | "fbk"
  | "ex"
  | "skatt";

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

export const snomedConfig = {
  linkBrowser(edition: string, snomedId: string) {
    return `https://browser.ihtsdotools.org/?perspective=full&conceptId1=${snomedId}&edition=MAIN/SNOMEDCT-NO/${edition}&release=&languages=no,en`;
  },
};

export const systemTermbases = ["DOMENE", "LISENS"];
