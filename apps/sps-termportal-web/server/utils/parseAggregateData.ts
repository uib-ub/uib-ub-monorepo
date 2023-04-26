import { LabelPredicate, Matching } from "../../utils/vars";
import { LangCode } from "../../utils/vars-language";
import { Samling } from "../../utils/vars-termbase";
import { SearchDataStats } from "~~/composables/states";

type AggregateKeys = LangCode | Samling | LabelPredicate | Matching;
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
  return {
    ...obj,
    ...{
      [category]: JSON.parse(Object.values(subObj)[0].value),
    },
  };
}
