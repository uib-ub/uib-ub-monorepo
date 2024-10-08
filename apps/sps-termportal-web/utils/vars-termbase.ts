// export type Samling =
//   | "ARTSDB"
//   | "MRT"
//   | "UHR"
//   | "EVERTEBRATER"
//   | "NHH"
//   | "NOJU"
//   | "NOT"
//   | "RTT"
//   | "SDIR"
//   | "TOLKING"
//   | "ROMFYS"
//   | "KLIMA"
//   | "LINGVISTIKK"
//   | "ASTRONOMI"
//   | "BIOLOGI"
//   | "SEMANTIKK"
//   | "LINGVISTIKK"
//   | "SEMANTIKK"
//   | "CMBIOLOGI"
//   | "KJEMI"
//   | "FBK"
//   | "BIBINF"
//   | "UDEUT"
//   | "SKOG"
//   | "SNOMEDCT"
//   | "SVV"
//   | "TOT"
//   | "WHT";

export type Domains =
  | "DOMENE-3AHumaniora"
  | "DOMENE-3ANaturvitenskapTeknologi"
  | "DOMENE-3ASamfunnsfag"
  | "DOMENE-3AOkonomiAdministrasjon";

// // TODO replace with lazy query
// export const termbaseOrder: Samling[] = [
//   "ARTSDB",
//   "ASTRONOMI",
//   "BIBINF",
//   // "BIOLOGI",
//   "CMBIOLOGI",
//   "EVERTEBRATER",
//   "FBK",
//   "KJEMI",
//   "KLIMA",
//   "LINGVISTIKK",
//   "MRT",
//   "NHH",
//   "NOJU",
//   "NOT",
//   "ROMFYS",
//   "SEMANTIKK",
//   "SKOG",
//   "SNOMEDCT",
//   "SDIR",
//   "SVV",
//   "RTT",
//   "TOT",
//   "TOLKING",
//   "UDEUT",
//   "UHR",
//   "WHT",
// ];

// // TODO replace with lazy query
// export const termbaseInfo: { [key in Samling]: LangCode[] } = {
//   ARTSDB: ["nb", "nn", "en", "la"],
//   ASTRONOMI: ["nb", "nn", "en"],
//   BIBINF: ["nb", "nn", "en", "da"],
//   BIOLOGI: [],
//   CMBIOLOGI: ["nb", "nn", "en"],
//   EVERTEBRATER: ["nb", "la"],
//   FBK: ["nb", "nn", "en"],
//   KJEMI: ["nb", "nn", "en", "da"],
//   KLIMA: ["nb", "nn", "en"],
//   LINGVISTIKK: ["nb", "nn", "en"],
//   SEMANTIKK: ["nb", "nn", "en"],
//   MRT: ["nb", "en", "da", "de", "es", "sv"],
//   SDIR: ["nb", "nn", "en"],
//   NHH: ["nb", "nn", "en"],
//   NOJU: ["nb", "de"],
//   NOT: ["nb", "nn", "en", "de", "fr", "la"],
//   ROMFYS: ["nb", "nn", "en"],
//   RTT: ["nb", "nn", "en", "da", "de", "fi", "fr", "it", "ru", "sv"],
//   SKOG: ["nb", "nn", "en", "de", "fr"],
//   SNOMEDCT: ["nb", "nn", "en"],
//   SVV: ["nb", "nn", "en"],
//   TOLKING: ["nb", "en", "ar", "fr", "pl", "ru", "so", "ti", "fa-af"],
//   TOT: ["nb", "nn", "en"],
//   UDEUT: ["nb", "nn", "en", "fr"],
//   UHR: ["nb", "nn", "en"],
//   WHT: ["nb", "nn", "en"],
// };

type CollectionUriPatternKey =
  | "bkg"
  | "nav"
  | "brreg"
  | "bufdir"
  | "fbk"
  | "ex"
  | "skatt";

export const termbaseUriPatterns: {
  [key in Samling]?: { [key in CollectionUriPatternKey]: string };
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
