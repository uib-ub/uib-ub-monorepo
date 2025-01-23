import type { LabelPredicate, Matching } from "../../utils/vars";
import type { LangCode } from "~/composables/locale";
import type { TermbaseId } from "~/utils/vars-termbase";
import type { SearchDataStats } from "~~/composables/states";

type AggregateKeys = LangCode | LabelPredicate | Matching | TermbaseId;
export default function (
  obj: {
    [key in keyof SearchDataStats]: {
      [key in keyof AggregateKeys]: string;
    };
  },
  subObj: {
    [key in keyof SearchDataStats]: { [key in keyof AggregateKeys]: string };
  }
) {
  const category = Object.keys(subObj)[0];
  const parsed = {
    ...obj,
    ...{
      [category]: JSON.parse(Object.values(subObj)[0].value),
    },
  };
  // Frontend shouldn't display distinction between cs and ci.
  // Combine them to "full"
  if (parsed?.matching?.["full-cs"] || parsed?.matching?.["full-ci"]) {
    const count =
      (parsed?.matching?.["full-cs"] || 0) +
      (parsed?.matching?.["full-ci"] || 0);
    parsed.matching.full = count;
    delete parsed.matching["full-cs"];
    delete parsed.matching["full-ci"];
  }
  return parsed;
}
