import { FetchType } from "./enums";

const appConfig = useAppConfig();

export {};

declare global {
  // base
  type SpecialUriTermbase = (typeof appConfig.tb.base.specialUriTbs)[number];
  type SystemTermbase = (typeof appConfig.tb.base.systemTermbases)[number];
  type LegacyTermbase = (typeof appConfig.tb.base.legacyTermbases)[number];
  type ConfiguredTermbase = Exclude<keyof typeof appConfig.tb, "base">;
  type TermbaseId =
    | ConfiguredTermbase
    | SystemTermbase
    | LegacyTermbase
    | SpecialUriTermbase
    | string;

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

  type LicensePageId = keyof typeof appConfig.license;

  // termbase
  interface Termbase {
    "@id": string;
    identifier: TermbaseId;
    type: string[];
    label: [{ "@language": LocalLangCode; "@value": string }];
    description: Record<LocalLangCode, string>;
    language: LangCode;
    opprinneligSpraak: LangCode;
    license: { "@id": LicensePageId };
    modified: { type: string; "@value": string };
    publisher: {
      "@id": string;
      type: string[];
      identifier: string;
      label: { "@language": string; "@value": string };
    };
    contactPoint: { hasEmail: string; hasTelephone: string };
  }

  // concept data
  type SemanticRelation = keyof typeof appConfig.data.semanticRelations;

  type LabelPredicate = (typeof appConfig.data.predicates)[number];

  type Domains =
    | "DOMENE-3AHumaniora"
    | "DOMENE-3ANaturvitenskapTeknologi"
    | "DOMENE-3ASamfunnsfag"
    | "DOMENE-3AHelse_og_sosial"
    | "DOMENE-3AOkonomiAdministrasjon";

  // search
  type QueryType = "search" | "concept" | "termbase";

  type SearchQueryType = "entries" | "aggregate";

  type Matching = (typeof appConfig.data.matching)[number];
  type MatchingNested = Matching | Matching[];

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
    situation: FetchType;
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
