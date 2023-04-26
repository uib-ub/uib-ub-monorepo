import { useI18n } from "vue-i18n";
import { LangCode, LocalLangCode } from "./vars-language";
import { SemanticRelation } from "./vars";
import { SearchDataEntry } from "~~/composables/states";

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
  const i18n = useI18n();
  let title = null;
  const languages = languageOrder[i18n.locale.value as LocalLangCode].slice(
    0,
    3
  );
  for (const lang of languages) {
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
  data,
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
          const link = "/" + target.replace("-3A", "/");
          // Don't return links with no label -> linked concept doesn't exist
          if (label) {
            return [label, link];
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
    );
    const cleanedUp = tmpRelData.filter(
      (entry: null | Array<Array<string>>) => entry
    );
    if (cleanedUp.length > 0) {
      relationData = tmpRelData;
    }
  }
  return relationData;
}
