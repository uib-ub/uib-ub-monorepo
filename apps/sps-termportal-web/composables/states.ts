

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
