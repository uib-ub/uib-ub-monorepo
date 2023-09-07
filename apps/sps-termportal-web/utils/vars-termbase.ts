import { LangCode } from "~/composables/locale";

export type Samling =
  | "ARTSDB"
  | "MRT"
  | "UHR"
  | "EVERTEBRATER"
  | "NHH"
  | "NOJU"
  | "NOT"
  | "RTT"
  | "SDIR"
  | "TOLKING"
  | "ROMFYS"
  | "KLIMA"
  | "LINGVISTIKK"
  | "ASTRONOMI"
  | "BIOLOGI"
  | "SEMANTIKK"
  | "LINGVISTIKK"
  | "CMBIOLOGI"
  | "KJEMI"
  | "FBK"
  | "BIBINF"
  | "UDEUT" ;

export type Domains =
  | "DOMENE-3AHumaniora"
  | "DOMENE-3ANaturvitenskapTeknologi"
  | "DOMENE-3ASamfunnsfag"
  | "DOMENE-3AOkonomiAdministrasjon";

export const termbaseOrder: Samling[] = [
  "ARTSDB",
  "ASTRONOMI",
  "BIBINF",
  // "BIOLOGI",
  "CMBIOLOGI",
  "EVERTEBRATER",
  "FBK",
  "KJEMI",
  "KLIMA",
  "LINGVISTIKK",
  "MRT",
  "NHH",
  "NOJU",
  "NOT",
  "ROMFYS",
  "RTT",
  "SEMANTIKK",
  "SDIR",
  "TOLKING",
  "UDEUT",
  "UHR",
];

export const termbaseInfo: { [key in Samling]: LangCode[] } = {
  ARTSDB: ["nb", "nn", "en", "la"],
  ASTRONOMI: ["nb", "nn", "en"],
  BIBINF: ["nb", "nn", "en", "da"],
  BIOLOGI: [],
  CMBIOLOGI: ["nb", "nn", "en"],
  EVERTEBRATER: ["nb", "la"],
  FBK: ["nb", "nn", "en"],
  KJEMI: ["nb", "nn", "en", "da"],
  KLIMA: ["nb", "nn", "en"],
  LINGVISTIKK: ["nb", "nn", "en"],
  SEMANTIKK: ['nb', "nn", "en"],
  MRT: ["nb", "en", "da", "de", "es", "sv"],
  SDIR: ["nb", "nn", "en"],
  NHH: ["nb", "nn", "en"],
  NOJU: ["nb", "de"],
  NOT: ["nb", "nn", "en", "de", "fr", "la"],
  ROMFYS: ["nb", "nn", "en"],
  RTT: ["nb", "nn", "en", "da", "de", "fi", "fr", "it", "ru", "sv"],
  TOLKING: ["nb", "en", "ar", "fr", "pl", "ru", "so", "ti", "fa-af"],
  UDEUT: ["nb", "nn", "en", "fr"],
  UHR: ["nb", "nn", "en"],
};

export const domainNesting = {
  "DOMENE-3AHumaniora": { bases: ["LINGVISTIKK", "SEMANTIKK"] },
  "DOMENE-3ANaturvitenskapTeknologi": {
    bases: [
      "NOT",
      "MRT",
      "SDIR",
      "ARTSDB",
      "EVERTEBRATER",
      "RTT",
      "ROMFYS",
      "KLIMA",
      "ASTRONOMI",
      // "BIOLOGI",
      "CMBIOLOGI",
      "KJEMI",
    ],
  },
  "DOMENE-3ASamfunnsfag": { bases: ["BIBINF", "NOJU", "TOLKING", "UDEUT"] },
  "DOMENE-3AOkonomiAdministrasjon": { bases: ["NHH", "FBK", "UHR"] },
};

type CollectionUriPatternKey = "bkg" | "nav" | "brreg" | "bufdir" | "fbk" | "ex";
export const termbaseUriPatterns: {
  [key in Samling]?: { [key in CollectionUriPatternKey]: string };
} = {
  FBK: {
    bkg: "http://begrepskatalogen/begrep/",
    nav: "https://data.nav.no/begrep/",
    brreg: "http://data.brreg.no/begrep/",
    bufdir: "https://data.bufdir.no/begrep/",
    fbk: "https://concept-catalog.fellesdatakatalog.digdir.no/collections/",
    ex: "http://example.com/"
  },
};
