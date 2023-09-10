import { Samling, Domains } from "./vars-termbase";
import { LangCode } from "~/composables/locale";

export type QueryType = "search" | "concept" | "termbase";
export type SearchQueryType = "entries" | "aggregate";

export type LabelPredicate = "prefLabel" | "altLabel" | "hiddenLabel";
export type Matching =
  | "full"
  | "full-cs"
  | "full-ci"
  | "startsWith-ci"
  | "endsWith-ci"
  | "subWord-ci"
  | "contains-ci";
export type MatchingNested = Matching | Matching[];

export type SearchQueryResponse = {
  head: { vars: string[] };
  results: { bindings: any[] };
};

export const predicateOrder: LabelPredicate[] = [
  "prefLabel",
  "altLabel",
  "hiddenLabel",
];
export const matchingOrder: Matching[] | Matching[][] = [
  "full",
  "startsWith-ci",
  "endsWith-ci",
  "subWord-ci",
  "contains-ci",
];

export type SemanticRelation =
  | "narrower"
  | "specializes"
  | "isPartOf"
  | "broader"
  | "generalizes"
  | "hasPart"
  | "related"
  | "seeAlso"
  | "replaces"
  | "replacedBy";

export const semanticRelationTypes: SemanticRelation[] = [
  "narrower",
  "specializes",
  "isPartOf",
  "broader",
  "generalizes",
  "hasPart",
  "related",
  "seeAlso",
  "replaces",
  "replacedBy",
];

export interface SearchOptions {
  type: QueryType;
  subtype: SearchQueryType;
  situation: string;
  term: string;
  language: (LangCode | "all")[];
  translate: LangCode | "none";
  termbase: Samling[];
  useDomain: boolean;
  domain: (Domains | "all")[];
  predicate: LabelPredicate[];
  matching: (Matching | "all")[] | Matching[][];
  limit: number;
  offset: any;
}

export const searchOptionsInfo = {
  type: { default: "search" },
  subtype: { default: "" },
  situation: { default: "" },
  term: { q: "q", default: null },
  language: { q: "ss", default: "all" },
  translate: { q: "ms", default: "none" },
  termbase: { q: "tb", default: "all" },
  domain: { q: "d", default: {} },
  predicate: { default: ["prefLabel", "altLabel", "hiddenLabel"] },
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
};

export const cookieDefaultOptions = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};

export const cookieLocaleOptions = {
  ...cookieDefaultOptions,
  ...{ httpOnly: false, maxAge: 60 * 60 * 24 * 100 },
};

export const licenseLinks = {
  "LISENS-3ANo_Rights_Reserved_-28CC0-29":
    "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
  "LISENS-3AClarin_ID-2DEDU-2DBY-2DNC-2DNORED":
    "https://urn.fi/urn:nbn:fi:lb-2019071724",
  "LISENS-3ACC_BY_40":
    "https://creativecommons.org/licenses/by/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DNC_40":
    "https://creativecommons.org/licenses/by-nd/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DNC-2DND_40":
    "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.no",
};
