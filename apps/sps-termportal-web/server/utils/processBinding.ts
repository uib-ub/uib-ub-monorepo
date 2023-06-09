import { SearchDataEntry } from "~~/composables/states";
import { termbaseUriPatterns } from "~~/utils/vars-termbase";

/* Search data preprocessing
 */

/**
 * Return preprocessed search result
 *
 * @param binding - Object that represents one match
 */
export default function (binding: { [key: string]: any }): SearchDataEntry {
  const runtimeConfig = useRuntimeConfig();
  const samling = binding.samling.value;

  const predicate = binding.predicate.value.replace(
    "http://www.w3.org/2008/05/skos-xl#",
    ""
  );

  let link;
  if (!Object.keys(termbaseUriPatterns).includes(samling)) {
    link = binding.uri.value
      .replace(runtimeConfig.public.base, "")
      .replace("-3A", "/");
  } else {
    const patterns = termbaseUriPatterns[samling];
    for (const pattern in patterns) {
      if (binding.uri.value.startsWith(patterns[pattern])) {
        const id = binding.uri.value.replace(patterns[pattern], "");
        link = `${samling}/${pattern}/${id}`;
        break;
      }
    }
  }
  return {
    predicate,
    label: binding.literal.value,
    link,
    lang: binding.lang.value.split(","),
    samling,
    matching: binding.matching.value,
    score: binding.score.value,
    translate: binding?.translate?.value || "",
  };
}
