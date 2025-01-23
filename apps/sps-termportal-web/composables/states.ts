import type { LangCode } from "./locale";
import type { LabelPredicate, Matching, uiConfig } from "~~/utils/vars";
import type { TermbaseId } from "~~/utils/vars-termbase";

export interface SearchDataEntry {
  predicate: string;
  label: string;
  link: string;
  lang: string[];
  samling: string;
  matching: string;
  translate?: string;
  score?: string;
}

export interface SearchDataStats {
  lang?: { [key in LangCode]: number };
  samling?: { [key: TermbaseId]: number };
  predicate?: { [key in LabelPredicate]: number };
  matching?: { [key in Matching]: number };
  context?: { string: number };
}

export interface SearchInterface {
  term: string | null;
  language: LangCode | "all";
  translate: LangCode | "none";
  domain: Object;
  termbase: TermbaseId[];
  useDomain: boolean;
}

export const useSearchInterface = () =>
  useState<SearchInterface>("searchinterface", () => ({
    term: null,
    language: "all",
    translate: "none",
    termbase: [],
    domain: {},
    useDomain: true,
  }));

export const useAllowSearchFetch = () =>
  useState<boolean | null>("allowSearchFetch ", () => true);
export const useSearchBarWasFocused = () =>
  useState<boolean>("searchBarWasFocused", () => false);
export const useSearchterm = () => useState<string>("searchterm", () => "");
export const useSearchtermTermbase = () =>
  useState<string>("searchtermTermbase", () => "");
export const useSearchLanguage = () =>
  useState<string>("searchLanguage", () => "");
export const useSearchLanguageTermbase = () =>
  useState<string>("searchLanguageTermbase", () => "all");
export const useSearchTranslateTermbase = () =>
  useState<string>("searchTranslateTermbase", () => "none");

export const useSearchTermbase = () =>
  useState<Array<string>>("searchTermbase", () => []);
export const useSearchData = () =>
  useState<Array<SearchDataEntry>>("searchData", () => []);
export const useSearchFetchInitial = () =>
  useState<boolean>("serchFetchInitial", () => false);
export const useSearchDataPending = () =>
  useState<{ [key: string]: boolean }>("searchDataPending", () => ({
    aggregate: false,
    entries: false,
  }));
export const useSearchScrollBarPos = () =>
  useState<number>("searchScrollBarPos", () => 0);

export const useSearchDataCount = () => useState("searchDataCount", () => {});
export const useSearchDataStats = () =>
  useState<SearchDataStats>("searchDataStats", () => ({}));

export const useShowSearchFilter = () =>
  useState<boolean>("showSearchFilter", () =>
    uiConfig.wideUiBreakpoints.includes(useBreakpoint().value)
  );

export interface SearchFilterData {
  lang: LangCode[];
  samling: string[];
  predicate: LabelPredicate[];
  matching: Matching[];
  context: string[];
}
export const useSearchFilterSelection = () =>
  useState<SearchFilterData>("searchFilterSelection", () => ({
    lang: [],
    samling: [],
    predicate: [],
    matching: [],
    context: [],
  }));
export const useSearchFetchLatest = () =>
  useState<number>("searchFetchLatest", () => NaN);
export const useDataDisplayLanguages = () =>
  useState<Array<string>>("dataDisplayLanguages", () => [
    "nb",
    "nn",
    "en",
    "en-gb",
    "en-us",
    "ar",
    "da",
    "de",
    "es",
    "fi",
    "fr",
    "it",
    "la",
    "pl",
    "ru",
    "so",
    "sv",
    "ti",
  ]);
export const useConceptViewToggle = () =>
  useState<boolean>("conceptViewToggle", () => false);

export const useNavMenuExpanded = () =>
  useState<boolean>("navMenuExpanded", () => false);

export const useTermpostContext = () => useState("termpostContext", () => true);
export const useHeaderDisplayScope = () =>
  useState("headerDisplayScope", () => "default");

export const useBootstrapData = () =>
  useState<Object>("lazyLocales", () => ({
    lalo: { nb: {}, nn: {}, en: {} },
    termbase: {},
    domain: {
      "DOMENE-3ANaturvitenskapTeknologi": {},
      "DOMENE-3AHumaniora": {},
      "DOMENE-3ASamfunnsfag": {},
      "DOMENE-3AHelse_og_sosial": {},
      "DOMENE-3AOkonomiAdministrasjon": {},
    },
    loaded: false,
  }));
