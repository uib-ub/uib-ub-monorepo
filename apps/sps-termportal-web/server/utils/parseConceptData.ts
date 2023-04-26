/**
 * Parse concept data:
 * - identify objects
 * - identify subobjects with lang
 * - infer display data
 *
 * @param data - concept data
 */
export function parseConceptData(data, mainConceptId: string) {
  const languageProps = [
    "prefLabel",
    "altLabel",
    "hiddenLabel",
    "definisjon",
    "betydningsbeskrivelse",
  ];
  let identified;
  if (!data["@graph"]) {
    identified = identifyData([data]);
  } else {
    identified = identifyData(data["@graph"]);
  }
  identified = idSubobjectsWithLang(identified, languageProps);
  const languages = getConceptLanguages(
    identified[mainConceptId],
    languageProps
  );
  return {
    meta: {
      language: languages,
      maxLen: {
        altLabel: getMaxNumberOfInstances(identified[mainConceptId]?.altLabel),
        hiddenLabel: getMaxNumberOfInstances(
          identified[mainConceptId]?.hiddenLabel
        ),
      },
    },
    concept: identified,
  };
}

/**
 * Parse list of objects and return object where keys are "\@id"s from objects
 *
 * @param graph - List of objects to identity
 * @returns identified `graph`
 */
function identifyData(graph: Array<any>) {
  try {
    return Object.assign({}, ...graph.map((x) => ({ [x["@id"]]: x })));
  } catch (e) {}
  return {};
}

function idSubobjectsWithLang(
  data: any,
  labeltypes: string[]
): { [key: string]: string } {
  for (const id of Object.keys(data)) {
    for (const labeltype of labeltypes) {
      try {
        if (data[id][labeltype]) {
          data[id][labeltype] = updateLabel2(
            data[id][labeltype],
            id,
            labeltype
          );
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
function updateLabel2(data: any, conceptUri: string, labelType: string) {
  const newLabels: { [key: string]: Array<string> } = {};
  const labels: Array<string> = data;
  for (const label of labels) {
    let language;
    if (labelType === "definisjon" || labelType === "betydningsbeskrivelse") {
      language = label.label["@language"];
    } else if (labelType === "description") {
      // TODO deprecated?
      language = label["@language"];
    } else {
      language = label.literalForm["@language"];
      if (!validateLabel(label)) {
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
function validateLabel(label: any): boolean {
  const term = label.literalForm["@value"];
  const lang = label.literalForm["@language"];
  if (term || term !== "" || lang || lang !== "") {
    return true;
  } else {
    return false;
  }
}

function getConceptLanguages(concept, languageProps) {
  //  console.log(Object.keys(concept["prefLabel"]));
  const lang = languageProps.flatMap((prop) => {
    if (concept?.[prop]) {
      return Object.keys(concept[prop]);
    } else return [];
  });
  return [...new Set(lang)];
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
