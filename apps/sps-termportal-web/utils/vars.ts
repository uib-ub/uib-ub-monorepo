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
  | "seeAlso";

export const semanticRelationTypes: SemanticRelation[] = [
  "narrower",
  "specializes",
  "isPartOf",
  "broader",
  "generalizes",
  "hasPart",
  "related",
  "seeAlso",
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
