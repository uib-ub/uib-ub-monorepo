import { FetchType } from "./enums";
import * as z from "zod";
import {
  LangCode,
  LocaleLangCode,
  Termbase,
  TermbaseId,
  SpecialUriTermbase,
} from "./zod";

const appConfig = useAppConfig();

export {};

declare global {
  // base
  type SpecialUriTermbase = z.infer<typeof SpecialUriTermbase>;
  type SystemTermbase = (typeof appConfig.tb.base.systemTermbases)[number];
  type LegacyTermbase = (typeof appConfig.tb.base.legacyTermbases)[number];
  type ConfiguredTermbase = Exclude<keyof typeof appConfig.tb, "base">;
  type TermbaseId = z.infer<typeof TermbaseId>;

  // language
  type LocalLangCode = z.infer<typeof LocaleLangCode>;

  type LangCode = z.infer<typeof LangCode>;

  type LicensePageId = keyof typeof appConfig.license;

  type Termbase = z.infer<typeof Termbase>;

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
