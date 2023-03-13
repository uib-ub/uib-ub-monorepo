export type LabelPredicate = "prefLabel" | "altLabel" | "hiddenLabel";
export type Matching =
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
  "full-cs",
  "full-ci",
  "startsWith-ci",
  "endsWith-ci",
  "subWord-ci",
  "contains-ci",
];
export type QueryType = "entries" | "aggregate" | "count";

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
