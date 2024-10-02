/**
 * Parse concept data:
 * - identify objects
 * - identify subobjects with lang
 * - infer display data
 *
 * @param data - concept data
 */
export function parseConceptData(data: any, mainConceptId: string) {
  const languageProps = {
    proper: [
      "prefLabel",
      "altLabel",
      "hiddenLabel",
      "definisjon",
      "betydningsbeskrivelse",
      "hasUsage",
    ],
    ephemeral: ["hasEquivalenceData"],
  };
  let identified: any;
  if (!data["@graph"]) {
    identified = identifyData([data]);
  } else {
    identified = identifyData(data["@graph"]);
  }
  identified = idSubobjectsWithLang(
    identified,
    languageProps.proper.concat(languageProps.ephemeral)
  );
  const languages = getConceptLanguages(
    identified[mainConceptId],
    languageProps.proper
  );

  const startingLanguage = () => {
    let language = null;
    try {
      language = Object.entries(
        identified[mainConceptId]?.hasEquivalenceData
      ).filter(([k, v]) => {
        const key = v[0]?.value["@id"].split("/").slice(-1)[0];
        return key === "startingLanguage";
      })[0][0];
    } catch {}
    return language;
  };

  return {
    meta: {
      language: languages,
      startingLanguage: startingLanguage(),
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
export function identifyData(graph: Array<any>) {
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
          data[id][labeltype] = updateLabel(data[id][labeltype], labeltype);
        }
      } catch (e) {}
    }
  }
  return data;
}

/**
 * Returns new object with language as key for labels list.
 *
 * @param labels - Array of labels
 * @param labelType - label type to update
 * @returns object for labeltype with list for each language
 */
function updateLabel(labels: Array<Record<string, any>>, labelType: string) {
  const newLabels: { [key: string]: Array<string> } = {};
  for (const label of labels) {
    if (labelType === "hasEquivalenceData") {
      addLabel(newLabels, label, label.language);
    } else if (
      labelType === "definisjon" ||
      labelType === "betydningsbeskrivelse" ||
      labelType === "hasUsage"
    ) {
      // FBK sometimes stored multiple definition strings in the same definition object.
      // Go through all entries and reinsert merknad etc. that might be shared
      if (Array.isArray(label?.label)) {
        for (const currentLabel of label.label) {
          const fullLabel = { label: currentLabel };
          addLabel(
            newLabels,
            { ...label, ...fullLabel },
            currentLabel["@language"]
          );
        }
      } else {
        addLabel(newLabels, label, label.label["@language"]);
      }
    } else if (labelType === "description") {
      addLabel(newLabels, label, label["@language"]);
    } else {
      for (const lf of label.literalForm) {
        const fullLabel = { literalForm: lf };
        addLabel(newLabels, { ...label, ...fullLabel }, lf["@language"]);
      }
    }
  }
  return newLabels;
}

function addLabel(
  newLabels: Record<string, any>,
  label: Record<string, any>,
  language: string
) {
  try {
    // key already exists
    newLabels[language].push(label);
  } catch (e) {
    // key doesn't exist
    newLabels[language] = [];
    newLabels[language].push(label);
  }
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

function getConceptLanguages(concept: any, languageProps: string[]) {
  const lang = languageProps.flatMap((prop) => {
    // only equivalence shouldn't be displayed
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
