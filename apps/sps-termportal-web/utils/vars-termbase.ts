import { LangCode } from "~/composables/locale";

export type Samling =
  | "ARTSDB"
  | "MRT"
  | "MRT2"
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
  | "LINGVISTIKK"
  | "CMBIOLOGI"
  | "KJEMI"
  | "FBK";

export type Domains =
  | "DOMENE-3AHumaniora"
  | "DOMENE-3ANaturvitenskapTeknologi"
  | "DOMENE-3ASamfunnsfag"
  | "DOMENE-3AOkonomiAdministrasjon";

export const termbaseOrder: Samling[] = [
  "ARTSDB",
  "ASTRONOMI",
  // "BIOLOGI",
  "CMBIOLOGI",
  "EVERTEBRATER",
  "FBK",
  "KJEMI",
  "KLIMA",
  "LINGVISTIKK",
  "MRT",
  "MRT2",
  "SDIR",
  "NHH",
  "NOJU",
  "NOT",
  "ROMFYS",
  "RTT",
  "TOLKING",
  "UHR",
];

export const termbaseInfo: { [key in Samling]: LangCode[] } = {
  ARTSDB: ["nb", "nn", "en", "la"],
  ASTRONOMI: ["nb", "nn", "en"],
  BIOLOGI: [],
  CMBIOLOGI: ["nb", "nn", "en"],
  EVERTEBRATER: ["nb", "la"],
  FBK: ["nb", "nn", "en"],
  KJEMI: ["nb", "nn", "en", "da"],
  KLIMA: ["nb", "nn", "en"],
  LINGVISTIKK: ["nb", "nn", "en"],
  MRT: ["nb", "en", "ar", "da", "de", "es", "sv"],
  MRT2: ["nb", "en", "da", "de", "la", "sv"],
  SDIR: ["nb", "nn", "en"],
  NHH: ["nb", "nn", "en"],
  NOJU: ["nb", "de"],
  NOT: ["nb", "nn", "en", "de", "fr", "la"],
  ROMFYS: ["nb", "nn", "en"],
  RTT: ["nb", "nn", "en", "da", "de", "fi", "fr", "it", "ru", "sv"],
  TOLKING: ["nb", "en", "ar", "fr", "pl", "ru", "so", "ti", "fa-af"],
  UHR: ["nb", "nn", "en"],
};

export const domainNesting = {
  "DOMENE-3AHumaniora": { bases: ["LINGVISTIKK"] },
  "DOMENE-3ANaturvitenskapTeknologi": {
    bases: [
      "NOT",
      "MRT",
      "MRT2",
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
  "DOMENE-3ASamfunnsfag": { bases: ["NOJU", "TOLKING"] },
  "DOMENE-3AOkonomiAdministrasjon": { bases: ["NHH", "FBK", "UHR"] },
};

type CollectionUriPatternKey = "bkg" | "nav" | "brreg" | "bufdir" | "fbk";
export const termbaseUriPatterns: {
  [key in Samling]?: { [key in CollectionUriPatternKey]: string };
} = {
  FBK: {
    bkg: "http://begrepskatalogen/begrep/",
    nav: "https://data.nav.no/begrep/",
    brreg: "http://data.brreg.no/begrep/",
    bufdir: "https://data.bufdir.no/begrep/",
    fbk: "https://concept-catalog.fellesdatakatalog.digdir.no/collections/",
  },
};
