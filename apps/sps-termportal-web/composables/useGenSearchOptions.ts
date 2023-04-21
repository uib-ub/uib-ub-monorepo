export default function (situation: string, options?: Object) {
    const searchOptions = useSearchOptions();
    const searchFilterData = useSearchFilterData();

    const newOptions = {
      type: "search",
      subtype: undefined,
      situation,
      // searchOptionsInterface
      term: searchOptions.value.searchTerm || "",
      language: [searchOptions.value.searchLanguage],
      translate: searchOptions.value.searchTranslate,
      termbase: [searchOptions.value.searchBase],
      domain: searchOptions.value.searchDomain,
      // default data
      predicate: searchOptionsInfo.predicate.default,
      matching: searchOptionsInfo.matching.default,
      limit: searchOptionsInfo.limit.default,
      offset: searchOptionsInfo.offset.default,
    };

    if (newOptions.term.length === 0) {
      newOptions.matching = [["all"]];
    }

    if (situation === "filter" || situation === "further") {
      console.log("filtering...");

      if (searchFilterData.value.samling.length > 0) {
        newOptions.termbase = searchFilterData.value.samling;
      }
      if (searchFilterData.value.lang.length > 0) {
        newOptions.language = searchFilterData.value.lang;
      }
      if (searchFilterData.value.predicate.length > 0) {
        newOptions.predicate = searchFilterData.value.predicate;
      }
      if (searchFilterData.value.matching.length > 0) {
        newOptions.matching = searchFilterData.value.matching;
      }
    }
    if (options) {
      return { ...newOptions, ...options };
    } else return newOptions;
  }