import { SearchOptions } from "../composables/states";
import { Matching, QueryType, LabelPredicate } from "../utils/vars";
import { Samling, Domains } from "./vars-termbase";

const htmlHighlight = {
  open: "<mark class='tp-shighlight'>",
  close: "</mark>",
};

const samlingMapping = {
  MRT: 3000,
  MRT2: 3002,
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
};

export function getTermData(
  term: string,
  highlight: { [key: string]: string }
) {
  return {
    term,
    sanitized: () =>
      term
        .replace(/-|\(|\)|<|>|\[|\]|\/|,\s*$|\*|~|_/g, " ")
        .replace(/\s\s+/g, " ")
        .trim(),
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
    termHL: () =>
      term.replace(/((?!, )[\p{Letter}\p{Mark}\d,])+/giu, function (x) {
        return highlight.open + x + highlight.close;
      }),
    termHLstart: function () {
      if (this.termHL().endsWith(highlight.close)) {
        return this.termHL().slice(0, -highlight.close.length);
      } else {
        return this.termHL();
      }
    },
    termHLend: function () {
      if (this.termHL().startsWith(highlight.open)) {
        return this.termHL().slice(highlight.open.length);
      } else {
        return this.termHL();
      }
    },
    queryHighlight: () =>
      `highlight:s:${highlight.open} | e:${highlight.close}`,
  };
}

export function getGraphData(
  searchDomain: string[],
  graphKey: string | string[]
): string[] {
  if (typeof graphKey === "string" && graphKey !== "all") {
    return ["", `ns:${samlingMapping[graphKey as Samling]}`];
  } else if (Array.isArray(graphKey) && graphKey.length > 0) {
    const bases = graphKey
      .map((key) => `FROM NAMED ns:${samlingMapping[key as Samling]}`)
      .join("\n  ");
    return [`\n  ${bases}`, "?G"];
  } else if (searchDomain[0] !== "all") {
    const domainBases = domainNesting[searchDomain[0] as Domains].bases;
    const mappedBases = domainBases
      .map((key) => `FROM NAMED ns:${samlingMapping[key as Samling]}`)
      .join("\n  ");
    return [`\n  ${mappedBases}`, "?G"];
  } else {
    return ["", "<urn:x-arq:UnionGraph>"];
  }
}

export function getLanguageData(language: string | string[]): string[] {
  if (Array.isArray(language)) {
    return language;
  } else if (language !== "all") {
    return [language];
  } else {
    return [""];
  }
}

function getLanguageWhere(
  subqueries,
  queryTypeIn: string,
  match: string,
  lang: string
): string {
  let queryType = queryTypeIn;
  if (queryType === "aggregate") {
    queryType = "count";
  }

  if (match === "all") {
    if (!lang) {
      return subqueries(queryType, match).where.replace("{languageFilter}", "");
    } else {
      return subqueries(queryType, match).where.replace(
        "{languageFilter}",
        `FILTER ( langmatches(lang(?lit), "${lang}") )`
      );
    }
  } else if (!lang) {
    return subqueries(queryType, match).where.replace("{language}", "");
  } else {
    return subqueries(queryType, match).where.replace(
      "{language}",
      `"lang:${lang}"`
    );
  }
}

function getPredicateValues(predicate: LabelPredicate[]): string {
  const predLength = predicate.length;
  if (predLength === 0 || predLength === 3) {
    return "";
  } else {
    const filterPred = predicate.map((p) => `skosxl:${p}`).join(" ");
    return `VALUES ?predicate { ${filterPred} }`;
  }
}

export function genSearchQuery(
  searchOptions: SearchOptions,
  queryType: QueryType,
  matching: string[],
  querySituation
): string {
  const termData = getTermData(searchOptions.searchTerm, htmlHighlight);
  const graph = getGraphData(
    searchOptions.searchDomain,
    searchOptions.searchBase
  );
  const language = getLanguageData(searchOptions.searchLanguage);
  const predFilter = getPredicateValues(searchOptions.searchPredicate);

  if (matching[0] === "all" && queryType === "entries") {
    return genSearchQueryAll(
      searchOptions,
      graph,
      language,
      predFilter,
      querySituation
    );
  } else {
    const aggregateCategories = [
      "?lang",
      "?samling",
      "?predicate",
      "?matching",
    ];
    const subqueries = (
      queryType: QueryType,
      subEntry: string,
      aggregateMatch?: string
    ) => {
      const content = {
        entries: {
          "full-cs": {
            score: 500,
            where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( str(?lit) = "${termData.termHL()}" ).`,
          },
          "full-ci": {
            score: 400,
            where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( lcase(str(?lit)) = lcase("${termData.termHL()}") &&
                     str(?lit) != "${termData.termHL()}" ).`,
          },
          "startsWith-ci": {
            score: 300,
            where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( strStarts(lcase(?lit), lcase("${termData.termHLstart()}") ) &&
                     lcase(str(?lit)) != lcase("${termData.termHL()}") ).`,
          },
          "endsWith-ci": {
            score: 200,
            where: `{ (?label ?sc ?lit) text:query ("${termData.doubleStarred()}" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( strEnds(lcase(?lit), lcase("${termData.termHLend()}") ) &&
                     lcase(str(?lit)) != lcase("${termData.termHL()}") ).`,
          },
          "subWord-ci": {
            score: 100,
            where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.termHLstart()}")) &&
                     !strEnds(lcase(?lit), lcase("${termData.termHL()}")) ).`,
          },
          "contains-ci": {
            score: 0,
            where: `{ (?label ?sc ?lit) text:query ("(${termData.doubleStarred()}) NOT (${termData.starred()})" "${termData.queryHighlight()}" {language}). }`,
            filter: `FILTER ( !strEnds(lcase(?lit), lcase("${termData.termHLend()}")) ).`,
          },
        },
        count: {
          all: {
            where: `{ SELECT ?label ?lit
              WHERE {
                ?label skosxl:literalForm ?lit.
              {languageFilter}
              }
          }`,
            filter: "",
          },
          allPatterns: {
            where: `{ (?label ?sc ?lit) text:query ("${termData.doubleStarred()}" {language}).}`,
            filter: "",
          },
          "full-cs": {
            where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" {language}). }`,
            filter: `FILTER ( str(?lit) = "${termData.term}" ).`,
          },
          "full-ci": {
            where: `{ (?label ?sc ?lit) text:query ("\\"${termData.sanitized()}\\"" {language}). }`,
            filter: `FILTER ( lcase(str(?lit)) = lcase("${termData.term}") &&
                     str(?lit) != "${termData.term}" ).`,
          },
          "startsWith-ci": {
            where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" {language}). }`,
            filter: `FILTER ( strStarts(lcase(?lit), lcase("${termData.term}") ) &&
                     lcase(str(?lit)) != lcase("${termData.term}") ).`,
          },
          "endsWith-ci": {
            where: `{ (?label ?sc ?lit) text:query ("${termData.doubleStarred()}" {language}). }`,
            filter: `FILTER ( strEnds(lcase(?lit), lcase("${termData.term}") ) &&
                     lcase(str(?lit)) != lcase("${termData.term}") ).`,
          },
          "subWord-ci": {
            where: `{ (?label ?sc ?lit) text:query ("${termData.starred()}" {language}). }`,
            filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.term}")) &&
                     !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
          },
          "contains-ci": {
            where: `{ (?label ?sc ?lit) text:query ("(${termData.doubleStarred()}) NOT (${termData.starred()})" {language}). }`,
            filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.term}")) &&
                     !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
          },
        },
        aggregate: {
          lang: `${predFilter}
          ?uri ?predicate ?label
              BIND ( lang(?lit) as ?prop ).`,
          samling: `${predFilter}
          ?uri ?predicate ?label;
                    skosp:memberOf ?s.
                  BIND (replace(str(?s), "http://.*wiki.terminologi.no/index.php/Special:URIResolver/.*-3A", "") as ?prop)`,
          predicate: `${predFilter}
          ?uri ?predicate ?label;
               BIND (replace(str(?predicate), "http://www.w3.org/2008/05/skos-xl#", "") as ?prop)`,
          matching: `${predFilter}
          ?uri ?predicate ?label
                  BIND ("${aggregateMatch}" as ?prop)`,
        },
      };
      return content[queryType][subEntry];
    };

    const translate =
      searchOptions.searchTranslate !== "none" ? "?translate" : "";
    const translateOptional =
      searchOptions.searchTranslate !== "none"
        ? `OPTIONAL { ?uri skosxl:prefLabel ?label2 .
  ?label2 skosxl:literalForm ?translate .
  FILTER ( langmatches(lang(?translate), "${searchOptions.searchTranslate}") ) }`
        : "";

    const subqueryTemplate = (
      subqueries,
      category: string,
      queryType: string,
      match: string,
      where: string
    ) => {
      const subquery = {
        entries: `
      {
        SELECT ?label ?literal ?l (?sc + ${
          subqueries(queryType, match)?.score
        } as ?score) ?uri ?predicate ?samling ${translate}
               ("${match}" as ?matching)
        WHERE {
          ${where}
          ${subqueries(queryType, match)?.filter}
          ${predFilter}
          ?uri ?predicate ?label;
               skosp:memberOf ?s.
          ${translateOptional}
          BIND ( lang(?lit) as ?l ).
          BIND ( str(?lit) as ?literal ).
          BIND ( replace(str(?s), "http://.*wiki.terminologi.no/index.php/Special:URIResolver/.*-3A", "") as ?samling).
        }
        ORDER BY DESC(?score) lcase(?literal)
        LIMIT ${searchOptions.searchLimit}
        OFFSET ${searchOptions.searchOffset?.[match as Matching] || 0}
      }`,
        count: `
      {
        SELECT ("${match}" as ?matching) (count(?label) as ?count)
        WHERE {
          ${where}
          ${subqueries(queryType, match)?.filter}
        }
      }`,
        aggregate: `
              {
                SELECT ?prop
                WHERE {
                  GRAPH ${graph[1]} {
                    ${where}
                    ${subqueries("count", match)?.filter}
                    ${subqueries(queryType, category, match)}
                  }
                }
              }`,
      };

      if (queryType === "count" && matching.length === 1) {
        return subquery[queryType] + "\n        UNION {}";
      } else {
        return subquery[queryType as QueryType];
      }
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
      const subqueryArray: string[] = [];
      for (const match of matching) {
        const whereArray: string[] = [];
        if (queryType === "aggregate" && matching.length === 7) {
          language.forEach((lang) => {
            whereArray.push(
              getLanguageWhere(subqueries, queryType, "allPatterns", lang)
            );
          });
          const where = whereArray.join("\n            UNION\n            ");

          subqueryArray.push(
            subqueryTemplate(
              subqueries,
              category.replace("?", ""),
              queryType,
              "allPatterns",
              where
            )
          );
          break;
        } else {
          language.forEach((lang) => {
            whereArray.push(
              getLanguageWhere(subqueries, queryType, match, lang)
            );
          });
          const where = whereArray.join("\n            UNION\n            ");

          subqueryArray.push(
            subqueryTemplate(
              subqueries,
              category.replace("?", ""),
              queryType,
              match,
              where
            )
          );
        }
      }
      const subquery = subqueryArray.join("\n        UNION");

      if (queryType === "aggregate") {
        categoriesArray.push(categoryTemplate(category, subquery));
      } else {
        categoriesArray.push(subquery);
        break;
      }
    }
    const outerSubquery = categoriesArray.join("\n      UNION");

    const queryPrefix = () => `
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>`;

    const queryEntries = () => `
  #jterm-beta>${querySituation}>entry: ${JSON.stringify(searchOptions)}
  ${queryPrefix()}

  SELECT DISTINCT ?uri ?predicate ?literal ?samling ?score ${translate}
         (group_concat( ?l; separator="," ) as ?lang)
         ?matching ${graph[0]}
  WHERE {
    GRAPH ${graph[1]} {
      { ${outerSubquery}
      }
    }
  }
  GROUP BY ?uri ?predicate ?literal ?samling ?score ?matching ${translate}
  ORDER BY DESC(?score) lcase(?literal) DESC(?predicate)
  LIMIT ${searchOptions.searchLimit}`;

    const queryCount = () => `
  ${queryPrefix()}

  SELECT ?matching ?count ${graph[0]}
  WHERE {
    GRAPH ${graph[1]} {
      { ${outerSubquery}
      }
    }
  }`;

    const queryAggregate = () => `
  #jterm-beta>${querySituation}>aggregate: ${JSON.stringify(searchOptions)}
  ${queryPrefix()}

  SELECT ${aggregateCategories.join(" ")}
  ${graph[0]}
  WHERE {
    { ${outerSubquery}
    }
  }`;

    switch (queryType) {
      case "entries":
        return queryEntries();
      case "count":
        return queryCount();
      case "aggregate":
        return queryAggregate();
      default:
        throw new Error("queryType not matched");
    }
  }
}
