import { SearchOptions } from "~~/utils/vars";

function getActivationStatus(data, hierarchy) {
  const result = [];

  function traverse(entry, hierarchy, parentStatus) {
    const status = data[entry] ?? parentStatus;
    if (status) {
      result.push(entry);
    }
    if (hierarchy?.subdomains) {
      Object.keys(hierarchy.subdomains).forEach((child) => {
        traverse(child, hierarchy.subdomains[child], status);
      });
    }
  }

  Object.keys(hierarchy).forEach((topdomain) => {
    traverse(topdomain, hierarchy[topdomain], false);
  });

  return result;
}

export default function (situation: string, options?: SearchOptions) {
  const searchInterface = useSearchInterface();
  const searchFilterData = useSearchFilterData();
  const bootstrapData = useBootstrapData();

  const newOptions: SearchOptions = {
    type: "search",
    subtype: "",
    situation,
    // searchOptionsInterface
    term: searchInterface.value.term || "",
    language: [
      searchInterface.value.language,
      ...(searchInterface.value.language === "en" ? ["en-GB", "en-US"] : []),
    ], // jena seems to store them in this format
    translate: searchInterface.value.translate,
    termbase: searchInterface.value.termbase,
    domain: [Object.keys(searchInterface.value.domain)[0]], // TODO domain
    useDomain: searchInterface.value.useDomain,
    // default data
    predicate: searchOptionsInfo.predicate.default,
    matching: searchOptionsInfo.matching.default,
    limit: searchOptionsInfo.limit.default,
    offset: searchOptionsInfo.offset.default,
  };

  if (newOptions.term.length === 0) {
    newOptions.matching = [["all"]];
  }

  if (newOptions.useDomain) {
    const domainLst = getActivationStatus(
      searchInterface.value.domain,
      bootstrapData.value.domain
    );
    newOptions.domain = domainLst;
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
    if (searchInterface.value.useDomain) {
      if (searchFilterData.value.context.length > 0) {
        newOptions.domain = searchFilterData.value.context;
      }
    } else if (searchFilterData.value.context.length > 0) {
      newOptions.termbase = searchFilterData.value.context.map((tb) => {
        return tb.split("-3A")[0];
      });
    }

    // Check if flattened array includes "full"
    // Happens when filter is used
    if (newOptions.matching.flat().includes("full")) {
      newOptions.matching.splice(0, 1, ["full-cs", "full-ci"]);
    }
  }
  const merged = options ? { ...newOptions, ...options } : newOptions;

  if (situation === "autocomplete") {
    const reduced = {
      term: merged.term,
      language: merged.language,
      useDomain: merged.useDomain,
    };
    if (merged.useDomain) {
      reduced["domain"] = merged.domain;
    } else {
      reduced["termbase"] = merged.termbase;
    }
    return reduced;
  } else {
    return merged;
  }
}
