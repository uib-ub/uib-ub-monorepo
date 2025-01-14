import { SearchDataEntry } from "~~/composables/states";
import { TermbaseId } from "~~/utils/vars-termbase";
import { idOrUriToRoute } from "~~/utils/utils";
/* Search data preprocessing
 */

/**
 * Return preprocessed search result
 *
 * @param binding - Object that represents one match
 */
export default function (binding: { [key: string]: any }): SearchDataEntry {
  const samling = binding.samling.value.split("-3A")[0] as TermbaseId;
  const predicate =
    binding.predicate.value.replace("http://www.w3.org/2008/05/skos-xl#", "") ||
    "";
  return {
    predicate,
    label: binding.literal.value,
    link: "/tb" + idOrUriToRoute(samling, binding.uri.value),
    lang: binding.lang.value.split(","),
    samling,
    context: binding.context.value,
    matching: binding.matching.value,
    score: binding.score.value,
    translate: binding?.translate?.value || "",
  };
}
