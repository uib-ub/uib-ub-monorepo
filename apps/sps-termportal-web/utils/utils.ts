import { SemanticRelation } from "./vars";
import { LangCode } from "~/composables/locale";
import { SearchDataEntry } from "~/composables/states";

/**
 * Return unique intersection of two Arrays, sorted by order of first.
 *
 * @remarks Uses Set.prototype.has() to check for existence.
 * @param a - Array a
 * @param b - Array b
 */
export function intersectUnique(a: any[], b: any[]): any[] {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  return Array.from(intersection);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

/**
 * Return real count of searchentries based on the length of their language properties if present.
 *
 * @param matches - list of searchentries that contain languages as a list
 */
export function countSearchEntries(matches: SearchDataEntry[]): number {
  return sum(
    matches.map((entry) => {
      try {
        return entry.lang.length;
      } catch (e) {
        return 1;
      }
    })
  );
}

export function langRtoL(languageCode: LangCode) {
  if (languageRtoL.has(languageCode)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Get title for concept based on local language.
 * Precedence:
 * - prefLabel in local language
 * - altLabel in local language
 * Loop through prefLabel, altLabel of languages in local languageOrder
 *
 * @param data - concept data with labels
 * @returns localized title or null
 */
export function getConceptDisplaytitle(concept): string | null {
  const localeLangOrder = useLocaleLangOrder();
  let title = null;
  for (const lang of localeLangOrder.value) {
    for (const label of ["prefLabel", "altLabel"]) {
      if (concept?.[label]) {
        if (concept?.[label][lang]) {
          title = concept[label][lang]?.[0]?.literalForm["@value"];
          break;
        }
      }
    }
    if (title) {
      break;
    }
  }
  return title;
}

// TODO test/check if it works with FBK data
/**
 * Get properly/localized labelled links to related concepts.
 *
 * @param data - concept data
 * @param mainConceptId - id of starting concept
 * @param relationType - type of semantic relation
 * @returns List of semantic relation of relationtype: [label, link]
 */
export function getRelationData(
  data: any,
  mainConceptId: string,
  relationType: SemanticRelation
): Array<Array<string>> | null {
  let relationData = null;
  // Check if concept with id has relation of relationtype
  if (data[mainConceptId]?.[relationType]) {
    const tmpRelData = data[mainConceptId]?.[relationType].map(
      (target: string) => {
        try {
          // Pass concept object
          const label = getConceptDisplaytitle(data[target]);
          // Slashes are allowed on Pagenames, should be escaped
          // TODO might break links between concepts of external tbs
          // Termbase is part of URI (seperated by '-3A')
          const link = "/" + target.replace("/", "%2F").replace("-3A", "/");
          // Don't return links with no label -> linked concept doesn't exist
          if (label) {
            let relation = { target: [label, link] };

            const toReifiedProp = semanticRelationTypes[relationType][0];
            const fromReifiedProp = semanticRelationTypes[relationType][1];

            if (data[mainConceptId]?.[toReifiedProp]) {
              const reifiedRelation = data[mainConceptId]?.[
                toReifiedProp
              ].filter(
                (relation) =>
                  fromReifiedProp in relation &&
                  relation[fromReifiedProp].includes(mainConceptId)
              );
              if (reifiedRelation) {
                relation = { ...relation, ...reifiedRelation[0] };
              }
            }

            return relation;
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
    );
    // remove null entries
    const cleanedUp = tmpRelData.filter(
      (entry: null | Array<Array<string>>) => entry
    );
    if (cleanedUp.length > 0) {
      relationData = tmpRelData;
    }
  }
  return relationData;
}

/**
 * Create nested dictionary with related ressources of starting entry.
 *
 * @param data - Nested dictionaries with concept data
 * @param startId - key for starting point in dict
 * @param relation - relation to follow
 * @param newKey - Key to nest related entries under
 */
export function parseRelationsRecursively(
  data: Object,
  startId: string,
  relation: string,
  newKey: string
) {
  if (data?.[startId]?.[relation] && data[startId][relation].length > 0) {
    const relations = data[startId][relation].slice().reverse();

    return Object.assign(
      {},
      ...relations.map((startId: string) => ({
        [startId]: {
          [newKey]: parseRelationsRecursively(data, startId, relation, newKey),
        },
      }))
    );
  } else {
    return null;
  }
}

export function deleteValueFromList(
  arr: Array<string | number>,
  value: string | number
): boolean {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return index > -1;
}

export function getAllKeys(obj: Object): string[] {
  if (obj === null || typeof obj !== "object") {
    return [];
  }
  return Object.keys(obj).reduce((res: string[], key: string) => {
    const value = obj[key];
    if (typeof value === "object") {
      return [key, ...res, ...getAllKeys(value)];
    }
    return [key];
  }, []);
}

/**
 * Lazy Localization function with fallback based on localized language order.
 *
 * @param key - key to localize
 * @returns Localized label or key if not label present
 */
export function lalof(key: string): string {
  const bootstrapData = useBootstrapData();
  const locale = useLocale();
  const label = languageOrder[locale.value]
    .filter((lc) => Object.keys(languageOrder).includes(lc))
    .map((lc) => bootstrapData.value?.lalo?.[lc]?.[key])
    .find((value) => value !== undefined);
  return label ?? key;
}

export function htmlify(data: string): string {
  try {
    const pars = data
      .split("\n\n")
      .filter((p) => p)
      .map((p) => `<p>${p}</p>`)
      .join("");
    return pars;
  } catch (e) {
    return data;
  }
}

function flattenDict(dict: Object, nestingKey: string, level = 0): string[] {
  let items: string[] = [];
  for (const key in dict) {
    items.push([key, level]);
    if (typeof dict[key][nestingKey] === "object") {
      items = items.concat(
        flattenDict(dict[key][nestingKey], nestingKey, level + 1)
      );
    }
  }
  return items;
}

export function flattenOrderDomains(domains) {
  const bootstrapData = useBootstrapData();
  if (bootstrapData.value.domain) {
    const flatDomains = flattenDict(bootstrapData.value.domain, "subdomains");
    return flatDomains
      .filter((entry) => domains.includes(entry[0]))
      .map((entry) => entry[0]); // TODO should be removed and handled down the line
  } else {
    return [];
  }
}
