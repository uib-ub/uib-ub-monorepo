import { idOrUriToRoute } from "~~/utils/utils";

function extractOriginalCase(sourceString: string, searchTerm: string): string {
  const lowerSource = sourceString.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  const startIndex = lowerSource.indexOf(lowerSearch);
  return sourceString.substring(startIndex, startIndex + searchTerm.length);
}

function highlightMatch(matchedTerm: string, searchOptions: SearchOptions): string {
  try {
    const searchTerm = searchOptions.term;
    switch (searchOptions.matching[0]) {
      case "full-cs":
      case "full-ci":
      case "startsWith-ci":
      case "endsWith-ci": {
        const originalMatchCase = extractOriginalCase(matchedTerm, searchTerm);
        const highlightedTerm = matchedTerm.replace(originalMatchCase, `<mark>${originalMatchCase}</mark>`);
        return highlightedTerm;
      }
      default: {
        const searchTermElements = searchTerm.split(" ");
        let highlightedTerm = matchedTerm;
        for (const subterm of searchTermElements) {
          const originalMatchCase = extractOriginalCase(matchedTerm, subterm);
          highlightedTerm = highlightedTerm.replace(originalMatchCase, `<mark>${originalMatchCase}</mark>`);
        }

        return highlightedTerm;
      }
    }
  }
  catch {
    return matchedTerm;
  }
}

/**
 * Return preprocessed search result
 *
 * @param binding - Object that represents one match
 */
export default function (binding: { [key: string]: any }, searchOptions: SearchOptions): SearchDataEntry {
  const samling = binding.samling.value.split("-3A")[0] as TermbaseId;
  const predicate
    = binding.predicate.value.replace("http://www.w3.org/2008/05/skos-xl#", "")
      || "";
  return {
    predicate,
    // match
    label: highlightMatch(binding.literal.value, searchOptions),
    link: "/tb" + idOrUriToRoute(samling, binding.uri.value),
    lang: binding.lang.value.split(","),
    samling,
    context: binding.context.value,
    matching: binding.matching.value,
    score: binding.score.value,
    translate: binding?.translate?.value || "",
  };
}
