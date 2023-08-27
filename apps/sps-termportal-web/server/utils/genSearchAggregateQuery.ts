import {
  Matching,
  LabelPredicate,
  SearchOptions,
  SearchQueryType,
} from "../../utils/vars";
import { Samling, Domains, domainNesting } from "../../utils/vars-termbase";

import { getPredicateValues, getContextFilter } from "./genSearchEntryQuery";

export const samlingMapping = {
  MRT: 3000,
  UHR: 3004,
  ARTSDB: 3006,
  EVERTEBRATER: 3008,
  FBK: 3030,
  NHH: 3010,
  NOJU: 3012,
  NOT: 3014,
  RTT: 3016,
  SDIR: 3018,
  TOLKING: 3022,
  ROMFYS: 3024,
  TUNDUIA: 3900,
  KLIMA: 3802,
  ASTRONOMI: 3804,
  BIOLOGI: 3806,
  LINGVISTIKK: 3808,
  CMBIOLOGI: 3810,
  KJEMI: 3812,
  BIBINF: 3814,
};

function sanitizeTerm(term: string) {
  return term
    .replace(/-|\(|\)|<|>|\[|\]|\/|,\s*$|\*|~|'|"|_/g, " ")
    .replace(/\s\s+/g, " ")
    .replace(/\. /g, " ")
    .replace(/\.$/g, "")
    .trim();
}

function getTermData(term: string) {
  return {
    term,
    sanitized: () => sanitizeTerm(term),
    starred: function () {
      return this.sanitized()
        .split(/, | /)
        .map((t: string) => t + "*")
        .join(" AND ");
    },
    doubleStarred: function () {
      return this.sanitized()
        .split(/, | /)
        .map((t: string) => "*" + t + "*")
        .join(" AND ");
    },
  };
}

function getLanguageData(language: string[]): string[] {
  if (language[0] !== "all") {
    return language;
  } else {
    return [""];
  }
}

function getLanguageWhere(
  subqueries: any,
  match: Matching | "all" | "allPatterns",
  lang: string
): string {
  if (match === "all") {
    if (!lang) {
      return subqueries("count", match).where.replace("{languageFilter}", "");
    } else {
      return subqueries("count", match).where.replace(
        "{languageFilter}",
        `FILTER ( langmatches(lang(?lit), "${lang}") )`
      );
    }
  } else if (!lang) {
    return subqueries("count", match).where.replace("{language}", "");
  } else {
    return subqueries("count", match).where.replace(
      "{language}",
      `"lang:${lang}"`
    );
  }
}

export function genSearchAggregateQuery(searchOptions: SearchOptions): string {
  const runtimeConfig = useRuntimeConfig();
  const termData = getTermData(searchOptions.term);
  const language = getLanguageData(searchOptions.language);
  const predFilter = getPredicateValues(searchOptions.predicate);
  const context = getContextFilter(searchOptions);

  const aggregateCategories = ["?lang", "?context", "?predicate", "?matching"];
  const subqueries = (
    queryType: SearchQueryType | "count",
    subEntry: string,
    aggregateMatch?: string
  ) => {
    const aggregatePredFilter = () => {
      if (searchOptions.matching[0] === "all") {
        return "";
      } else {
        return `?uri ${predFilter} ?label .`;
      }
    };
    const content = {
      count: {
        all: {
          where: `{ SELECT ?label ?lit ?uri
                    WHERE {
                       {
                        SELECT * 
                        WHERE {
                          ?uri ${context[1]} ?con .
                          ${context[0]}
                        }
                      }
                      ?uri ${predFilter} ?label .
                      ?label skosxl:literalForm ?lit.
                      {languageFilter}
                    }
                  }`,
          filter: "",
        },
        allPatterns: {
          where: `{ (?label ?sc ?lit) text:query ("${termData.doubleStarred()}" 100000 {language}).}`,
          filter: "",
        },
        "full-cs": {
          where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" 100000 {language}). }`,
          filter: `FILTER ( str(?lit) = "${termData.term}" ).`,
        },
        "full-ci": {
          where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" 100000 {language}). }`,
          filter: `FILTER ( lcase(str(?lit)) = lcase("${termData.term}") &&
                       str(?lit) != "${termData.term}" ).`,
        },
        "startsWith-ci": {
          where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" 100000 {language}). }`,
          filter: `FILTER ( strStarts(lcase(?lit), lcase("${termData.term}") ) &&
                       lcase(str(?lit)) != lcase("${termData.term}") ).`,
        },
        "endsWith-ci": {
          where: `{ (?label ?sc ?lit) text:query ("${termData.doubleStarred()}" 100000 {language}). }`,
          filter: `FILTER ( strEnds(lcase(?lit), lcase("${termData.term}") ) &&
                       lcase(str(?lit)) != lcase("${termData.term}") ).`,
        },
        "subWord-ci": {
          where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" 100000 {language}). }`,
          filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.term}")) &&
                       !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
        },
        "contains-ci": {
          where: `{ (?label ?sc ?lit) text:query ("(${termData.doubleStarred()}) NOT (${termData.starred()})" 100000 {language}). }`,
          filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.term}")) &&
                       !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
        },
      },
      aggregate: {
        lang: `
                ${aggregatePredFilter()}
                BIND ( lang(?lit) as ?prop ).`,
        context: `
        ${aggregatePredFilter()}
            ?uri ${
              searchOptions.useDomain ? "skosp:domene" : "skosp:memberOf"
            } ?context.
                    BIND (replace(str(?context), "${
                      runtimeConfig.public.base
                    }", "") as ?prop)`,
        predicate: `
                ${aggregatePredFilter()}
                ?uri ?predicate ?label .
                BIND (replace(str(?predicate), "http://www.w3.org/2008/05/skos-xl#", "") as ?prop)`,
        matching: `
          ${aggregatePredFilter()}
                    BIND ("${aggregateMatch}" as ?prop)`,
      },
    };
    return content[queryType][subEntry];
  };

  const subqueryTemplate = (
    subqueries,
    category: string,
    match: Matching | "all" | "allPatterns",
    where: string
  ) => {
    const contextSubquery = () => {
      if (match === "all") {
        return "";
      } else {
        return `${context[0] ? "?uri " + context[1] + " ?con ." : ""}
                ${context[0]}`;
      }
    };
    const subquery = `
                {
                  SELECT ?prop
                  WHERE {
                    ${where}
                    ${subqueries("count", match)?.filter}
                    ${subqueries("aggregate", category, match)}
                    ${contextSubquery()}
                  }
                }`;
    return subquery;
  };

  const categoryTemplate = (category: string, subquery: string) => {
    return `
        {
          SELECT (concat("{", group_concat(?propCount; SEPARATOR=", "), "}") as ${category})
          WHERE {
            {
              SELECT ?prop (count(?prop) as ?pCount)
              WHERE {
              ${subquery}
              }
              GROUP BY ?prop
            }
          BIND (concat ('"', ?prop, '"', ': ', str(?pCount)) as ?propCount)
          }
        }`;
  };

  const categoriesArray: string[] = [];
  for (const category of aggregateCategories) {
    if (searchOptions.matching[0] === "all" && category === "?matching") {
      break;
    }
    const subqueryArray: string[] = [];
    for (const match of searchOptions.matching) {
      const whereArray: string[] = [];
      const matchOption =
        searchOptions.matching.length === 6 && category !== "?matching"
          ? "allPatterns"
          : match;

      language.forEach((lang) => {
        whereArray.push(getLanguageWhere(subqueries, matchOption, lang));
      });
      const where = whereArray.join("\n            UNION\n            ");

      subqueryArray.push(
        subqueryTemplate(
          subqueries,
          category.replace("?", ""),
          matchOption,
          where
        )
      );
      if (searchOptions.matching.length === 6 && category !== "?matching") {
        break;
      }
    }
    const subquery = subqueryArray.join("\n        UNION");

    categoriesArray.push(categoryTemplate(category, subquery));
  }
  const outerSubquery = categoriesArray.join("\n      UNION");

  const queryPrefix = () => `
    PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
    PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
    PREFIX text: <http://jena.apache.org/text#>
    PREFIX base: <${runtimeConfig.public.base}>
    PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>`;

  const queryAggregate = () => `
    #log: ${JSON.stringify(searchOptions)}
    ${queryPrefix()}
  
    SELECT ${aggregateCategories.join(" ")}
    WHERE {
      GRAPH <urn:x-arq:UnionGraph> {
        { ${outerSubquery}
        }
      }
    }`;

  return queryAggregate();
}
