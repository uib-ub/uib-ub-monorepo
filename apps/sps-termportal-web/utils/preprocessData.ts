import { LabelPredicate, Matching } from "./vars";
import { LangCode } from "./vars-language";
import { Samling } from "./vars-termbase";
import { SearchDataEntry, SearchDataStats } from "~~/composables/states";

/**
 * Returns object where keys are "\@id"s from objects
 *
 * @param graph - List of objects to identity
 * @returns identified `graph`
 */
export function identifyData(graph: Array<any>) {
  try {
    return Object.assign({}, ...graph.map((x) => ({ [x["@id"]]: x })));
  } catch (e) {}
  return {};
}

/**
 * Get set of language codes in labels of concept
 *
 * @param data - Data that represents a concept with labels with language code
 * @returns Set of present language codes
 */
export function getConceptLanguages(data: any): string[] {
  try {
    const prefLabel = Object.keys(data?.prefLabel || []);
    const altLabel = Object.keys(data?.altLabel || []);
    const hiddenLabel = Object.keys(data?.hiddenLabel || []);
    return [...new Set([...prefLabel, ...altLabel, ...hiddenLabel])];
  } catch (e) {
    return [];
  }
}

/**
 * Returns dataset where objects identified by uri are transformed to make labels accessible by lc.
 *
 * @param data - Dataset that houses concept data
 * @param conceptUris - Key for object that represents concept
 * @param labeltypes - List of label types to identify with language code
 * @returns Dataset where labels with same languagecode are grouped in object with lc as key
 */
export function idSubobjectsWithLang(
  data: any,
  conceptUris: string[],
  labeltypes: string[]
): { [key: string]: string } {
  for (const uri of conceptUris) {
    for (const labeltype of labeltypes) {
      try {
        if (data[uri][labeltype]) {
          data[uri][labeltype] = updateLabel(data, uri, labeltype);
        }
      } catch (e) {}
    }
  }
  return data;
}

/**
 * Returns new object with language as key for labels list.
 *
 * @param data - Dataset that represents concepts and labels
 * @param conceptUri - key for object that represents concept
 * @param labelType - label type to update
 * @returns object for labeltype with list for each language
 */
export function updateLabel(data: any, conceptUri: string, labelType: string) {
  const newLabels: { [key: string]: Array<string> } = {};
  const labels: Array<string> = data[conceptUri][labelType];
  for (const label of labels) {
    let language;
    if (labelType === "definisjon" || labelType === "betydningsbeskrivelse") {
      language = data[label].label["@language"];
    } else if (labelType === "description") {
      language = label["@language"];
    } else {
      language = data[label].literalForm["@language"];
      if (!validateLabel(data[label])) {
        break;
      }
    }
    try {
      // key already exists
      newLabels[language].push(label);
    } catch (e) {
      // key doesn't exist
      newLabels[language] = [];
      newLabels[language].push(label);
    }
  }
  return newLabels;
}

/**
 * Check if minimun data (term, language) on label object is present.
 *
 * @param label - Label object
 * @returns Boolean
 */
export function validateLabel(label: any): boolean {
  const term = label.literalForm["@value"];
  const lang = label.literalForm["@language"];
  if (term || term !== "" || lang || lang !== "") {
    return true;
  } else {
    return false;
  }
}

/**
 * Get max length for object with list as value.
 *
 * @param data - Object to be evluated.
 */
export function getMaxNumberOfInstances(data: {
  [key: string]: any[];
}): number {
  try {
    const lengths = Object.keys(data).map(function (key) {
      return data[key].length;
    });
    // const lengths = values.map((lang) => lang.length);
    return Math.max(...lengths);
  } catch (e) {
    return 0;
  }
}

/* Search data preprocessing
 */

/**
 * Return preprocessed search result
 *
 * @param binding - Object that represents one match
 */
export function processBinding(binding: {
  [key: string]: any;
}): SearchDataEntry {
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

type AggregateKeys = LangCode | Samling | LabelPredicate | Matching;
export function parseAggregateData(
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
