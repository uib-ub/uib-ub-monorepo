import { SearchOptions } from "~~/utils/vars";

export default function (situation: string, options?: SearchOptions) {
  const searchInterface = useSearchInterface();
  const searchFilterData = useSearchFilterData();

  const newOptions: SearchOptions = {
    type: "search",
    subtype: "",
    situation,
    // searchOptionsInterface
    term: searchInterface.value.term || "",
    language: [searchInterface.value.language],
    translate: searchInterface.value.translate,
    termbase: [searchInterface.value.termbase],
    domain: searchInterface.value.domain,
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
      newOptions.matching = searchFilterData.value.matching.map((e) => [e]);
    }
    // Check if flattened array includes "full"
    // Happens when filter is used
    if (newOptions.matching.flat().includes("full")) {
      newOptions.matching.splice(0, 1, ["full-cs", "full-ci"]);
    }
  }
  if (options) {
    return { ...newOptions, ...options };
  } else return newOptions;
}
