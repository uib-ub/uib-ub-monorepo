import { LangCode } from "./locale";
import { LabelPredicate, Matching } from "~~/utils/vars";
import { Samling } from "~~/utils/vars-termbase";

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
  samling?: { [key in Samling]: number };
  predicate?: { [key in LabelPredicate]: number };
  matching?: { [key in Matching]: number };
}

export interface SearchInterface {
  term: string | null;
  language: LangCode | "all";
  translate: LangCode | "none";
  domain: string[];
  termbase: Samling | "all";
  useDomain: boolean;
}

export const useDomainData = () =>
  useState("domainData", () => ({
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
    "DOMENE-3AOkonomiAdministrasjon": { bases: ["NHH", "FBK", "UHR"] },
    "DOMENE-3ASamfunnsfag": { bases: ["BIBINF", "NOJU", "TOLKING"] },
    "DOMENE-3AHumaniora": { bases: ["LINGVISTIKK"] },
  }));

export const useSearchInterface = () =>
  useState<SearchInterface>("searchinterface", () => ({
    term: null,
    language: "all",
    translate: "none",
    termbase: "all",
    domain: ["all"],
    useDomain: true
  }));

export const useAllowSearchFetch = () =>
  useState<boolean | null>("allowSearchFetch ", () => true);
export const useSearchBarWasFocused = () =>
  useState<boolean>("searchBarWasFocused", () => false);
export const useSearchterm = () => useState<string>("searchterm", () => "");
export const useSearchLanguage = () =>
  useState<string>("searchLanguage", () => "");
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
  useState<boolean>("showSearchFilter", () => false);

export interface SearchFilterData {
  lang: LangCode[];
  samling: string[];
  predicate: LabelPredicate[];
  matching: Matching[];
}
export const useSearchFilterData = () =>
  useState<SearchFilterData>("searchFilterData", () => ({
    lang: [],
    samling: [],
    predicate: [],
    matching: [],
  }));
export const useSearchFetchLatest = () =>
  useState<number>("searchFetchLatest", () => NaN);
export const useDataDisplayLanguages = () =>
  useState<Array<string>>("dataDisplayLanguages", () => [
    "nb",
    "nn",
    "en",
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

export const useLazyLocales = () =>
  useState<Object>("lazyLocales", () => ({ nb: {}, nn: {}, en: {} }));
