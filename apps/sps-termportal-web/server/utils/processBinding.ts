import { SearchDataEntry } from "~~/composables/states";
import { Samling, termbaseUriPatterns } from "~~/utils/vars-termbase";

/* Search data preprocessing
 */

/**
 * Return preprocessed search result
 *
 * @param binding - Object that represents one match
 */
export default function (binding: { [key: string]: any }): SearchDataEntry {
  const runtimeConfig = useRuntimeConfig();
  const samling = binding.samling.value.split("-3A")[0] as Samling;

  const predicate =
    binding.predicate.value.replace("http://www.w3.org/2008/05/skos-xl#", "") ||
    "";

  let link;
  if (!Object.keys(termbaseUriPatterns).includes(samling)) {
    link = binding.uri.value
      .replace(runtimeConfig.public.base, "")
      .replaceAll("/", "%2F") // Slashes are allowd in wiki pagenames, but cause problems with routing
      .replaceAll("-3A", "/");
  } else {
    const patterns =
      termbaseUriPatterns[samling as keyof typeof termbaseUriPatterns];
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
    context: binding.context.value,
    matching: binding.matching.value,
    score: binding.score.value,
    translate: binding?.translate?.value || "",
  };
}
