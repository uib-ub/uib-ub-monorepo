export {};

declare global {
  // base
  type TermbaseId = string;

  // language
  type LangCode =
    | "ar"
    | "da"
    | "de"
    | "en"
    | "en-gb"
    | "en-us"
    | "fa-af"
    | "fi"
    | "fr"
    | "it"
    | "la"
    | "nb"
    | "nn"
    | "pl"
    | "ru"
    | "so"
    | "es"
    | "sv"
    | "ti";
  type LocalLangCode = "en" | "nb" | "nn";

  // concept data
  type SemanticRelation =
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

  type LabelPredicate = "prefLabel" | "altLabel" | "hiddenLabel";

  type Domains =
    | "DOMENE-3AHumaniora"
    | "DOMENE-3ANaturvitenskapTeknologi"
    | "DOMENE-3ASamfunnsfag"
    | "DOMENE-3AHelse_og_sosial"
    | "DOMENE-3AOkonomiAdministrasjon";

  type CollectionUriPatternKey =
    | "bkg"
    | "nav"
    | "brreg"
    | "bufdir"
    | "fbk"
    | "ex"
    | "skatt";

  // search
  type QueryType = "search" | "concept" | "termbase";

  type SearchQueryType = "entries" | "aggregate";

  type Matching =
    | "full"
    | "full-cs"
    | "full-ci"
    | "startsWith-ci"
    | "endsWith-ci"
    | "subWord-ci"
    | "contains-ci";
  type MatchingNested = Matching | Matching[];

  type FetchType = "initial" | "options" | "filter" | "further";
  type AggregateKeys = LangCode | LabelPredicate | Matching | TermbaseId;

  interface SearchDataEntry {
    predicate: string;
    label: string;
    link: string;
    lang: string[];
    samling: string;
    matching: string;
    translate?: string;
    score?: string;
  }

  interface SearchDataStats {
    lang?: { [key in LangCode]: number };
    samling?: { [key: TermbaseId]: number };
    predicate?: { [key in LabelPredicate]: number };
    matching?: { [key in Matching]: number };
    context?: { string: number };
  }

  interface SearchInterface {
    term: string | null;
    language: LangCode | "all";
    translate: LangCode | "none";
    domain: Object;
    termbase: TermbaseId[];
    useDomain: boolean;
  }

  interface SearchFilterData {
    lang: LangCode[];
    samling: string[];
    predicate: LabelPredicate[];
    matching: Matching[];
    context: string[];
  }

  type SearchQueryResponse = {
    head: { vars: string[] };
    results: { bindings: any[] };
  };

  interface SearchOptions {
    type: QueryType;
    subtype: SearchQueryType;
    situation: string;
    term: string;
    language: (LangCode | "all")[];
    translate: LangCode | "none";
    termbase: TermbaseId[];
    useDomain: boolean;
    domain: (Domains | "all")[];
    predicate: LabelPredicate[];
    matching: (Matching | "all")[] | Matching[][];
    limit: number;
    offset: any;
  }
}
