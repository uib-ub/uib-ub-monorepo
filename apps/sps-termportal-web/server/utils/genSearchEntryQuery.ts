import type { Matching, LabelPredicate, SearchOptions } from "../../utils/vars";

export function sanitizeTerm(term: string) {
  return term
    .replace(/-|\(|\)|<|>|\[|\]|\/|,\s*$|\*|~|'|"|_/g, " ")
    .replace(/\s\s+/g, " ")
    .replace(/\. /g, " ")
    .replace(/\.$/g, "")
    .trim();
}

export function getTermData(term: string) {
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

export function getLanguageData(searchOptions: SearchOptions): string[] {
  if (searchOptions.language[0] !== "all") {
    if (searchOptions.situation.startsWith("filter")) {
      const tmplcs = searchOptions.language.map((lc) => {
        if (lc === "en-gb") {
          return "en-GB";
        } else if (lc === "en-us") {
          return "en-US";
        } else {
          return lc;
        }
      });
      return tmplcs;
    } else {
      return searchOptions.language;
    }
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
      return subqueries(match).where.replace("{languageFilter}", "");
    } else {
      return subqueries(match).where.replace(
        "{languageFilter}",
        `FILTER ( langmatches(lang(?lit), "${lang}") )`
      );
    }
  } else if (!lang) {
    return subqueries(match).where.replace("{language}", "");
  } else {
    return subqueries(match).where.replace("{language}", `"lang:${lang}"`);
  }
}

export function getPredicateValues(predicates: LabelPredicate[]): string {
  return predicates.map((p) => `skosxl:${p}`).join("|");
}

export function getContextFilter(searchOptions) {
  const pred = searchOptions.useDomain ? "skosp:domene" : "skosp:memberOf";
  const lst = searchOptions.useDomain
    ? searchOptions.domain
    : searchOptions.termbase;
  if (lst.length !== 0 && lst[0] !== "all") {
    const values = lst
      .map((d: string) => {
        if (searchOptions.useDomain) {
          return `base:${d}`;
        } else {
          return `base:${d}-3A${d}`;
        }
      })
      .join(", ");
    return [`FILTER ( ?con IN ( ${values} ) )`, pred];
  } else {
    return ["", pred];
  }
}

export function genSearchEntryQuery(searchOptions: SearchOptions): string {
  const runtimeConfig = useRuntimeConfig();
  const termData = getTermData(searchOptions.term);
  const language = getLanguageData(searchOptions);
  const predFilter = getPredicateValues(searchOptions.predicate);
  const context = getContextFilter(searchOptions);

  if (termData.sanitized().length === 0) {
    return genSearchQueryAll(searchOptions, language, predFilter, context);
  }

  const subqueries = (subEntry: string) => {
    const content = {
      "full-cs": {
        score: 500,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "\\"${termData.sanitized()}\\"" {language}). }`,
        filter: `FILTER ( str(?lit) = "${termData.term}" ).`,
      },
      "full-ci": {
        score: 400,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "\\"${termData.sanitized()}\\"" {language}). }`,
        filter: `FILTER ( lcase(str(?lit)) = lcase("${termData.term}") &&
                       str(?lit) != "${termData.term}" ).`,
      },
      "startsWith-ci": {
        score: 300,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "${termData.starred()}" {language}). }`,
        filter: `FILTER ( strStarts(lcase(?lit), lcase("${termData.term}") ) &&
                       lcase(str(?lit)) != lcase("${termData.term}") ).`,
      },
      "endsWith-ci": {
        score: 200,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "${termData.doubleStarred()}" {language}). }`,
        filter: `FILTER ( strEnds(lcase(?lit), lcase("${termData.term}") ) &&
                       lcase(str(?lit)) != lcase("${termData.term}") ).`,
      },
      "subWord-ci": {
        score: 100,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "${termData.starred()}" {language}). }`,
        filter: `FILTER ( !strStarts(lcase(?lit), lcase("${termData.term}")) &&
                       !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
      },
      "contains-ci": {
        score: 0,
        where: `{ (?label ?sc ?lit) text:query (skosxl:literalForm "(${termData.doubleStarred()}) NOT (${termData.starred()})" {language}). }`,
        filter: `FILTER ( !strEnds(lcase(?lit), lcase("${termData.term}")) ).`,
      },
    };
    return content[subEntry];
  };

  const translate = searchOptions.translate !== "none" ? "?translate" : "";
  // handles situation where 'en' is selected as target language and en-gb should be picked up
  // works under the assumption that there are not 'en' AND 'en-gb' in same concept
  const translateOptional =
    searchOptions.translate !== "none"
      ? `OPTIONAL { ?uri skosxl:prefLabel ?label2 .
    ?label2 skosxl:literalForm ?translate .
    FILTER ( lang(?translate) = "${searchOptions.translate}" ${
          searchOptions.translate === "en"
            ? "|| lang(?translate) = 'en-GB'"
            : ""
        })
    }`
      : "";

  const subqueryTemplate = (
    subqueries,
    match: Matching | "all" | "allPatterns",
    where: string
  ) => {
    const subquery = `
        {
          SELECT ?label ?literal ?l ?context ?samling (?sc + ${
            subqueries(match)?.score
          } as ?score) ?uri ?predicate ${translate}
                 ("${match}" as ?matching)
          WHERE {
            { SELECT * {
                ${where}
                ${subqueries(match)?.filter}
                ?uri ${predFilter} ?label ;
                     ${context[1]} ?con .
                ${context[0]}
                ${translateOptional}
              }
              ORDER BY DESC(?score) lcase(?literal)
              LIMIT ${searchOptions.limit}
              OFFSET ${searchOptions.offset?.[match as Matching] || 0}
            }
            ?uri ?predicate ?label .
            ?uri skosp:memberOf ?sam .
            BIND ( replace( str(?sam), "${
              runtimeConfig.public.base
            }", "") as ?samling).
            BIND ( lang(?lit) as ?l ).
            BIND ( str(?lit) as ?literal ).
            BIND ( replace(str(?con), "${
              runtimeConfig.public.base
            }", "") as ?context).
          }
        }`;

    return subquery;
  };

  const subqueryArray: string[] = [];
  for (const match of searchOptions.matching) {
    const whereArray: string[] = [];

    language.forEach((lang) => {
      whereArray.push(getLanguageWhere(subqueries, match, lang));
    });
    const where = whereArray.join("\n            UNION\n            ");

    subqueryArray.push(subqueryTemplate(subqueries, match, where));
  }
  const subquery = subqueryArray.join("\n        UNION");

  const queryPrefix = () => `
    PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
    PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
    PREFIX text: <http://jena.apache.org/text#>
    PREFIX base: <${runtimeConfig.public.base}>
    PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>`;

  const queryEntries = () => `
    ${queryPrefix()}
  
    SELECT DISTINCT ?uri ?predicate ?literal ?score ?context ?samling ${translate}
           (group_concat( lcase(?l); separator="," ) as ?lang)
           ?matching
    WHERE {
      GRAPH <urn:x-arq:UnionGraph> {
        { ${subquery}
        }
      }
    }
    GROUP BY ?uri ?predicate ?literal ?score ?matching ?context ?samling ${translate}
    ORDER BY DESC(?score) lcase(?literal) DESC(?predicate)
    LIMIT ${searchOptions.limit}`;

  return queryEntries();
}
