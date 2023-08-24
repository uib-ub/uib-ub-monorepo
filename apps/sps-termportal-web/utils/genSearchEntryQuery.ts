import { Matching, LabelPredicate, SearchOptions } from "./vars";

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

export function getLanguageData(language: string[]): string[] {
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

export function genSearchEntryQuery(searchOptions: SearchOptions): string {
  const runtimeConfig = useRuntimeConfig();
  const termData = getTermData(searchOptions.term);
  const language = getLanguageData(searchOptions.language);
  const predFilter = getPredicateValues(searchOptions.predicate);

  const context = () => {
    const pred = searchOptions.useDomain ? "skosp:domene" : "skosp:memberOf";
    const lst = searchOptions.useDomain
      ? searchOptions.domain
      : searchOptions.termbase;
    const values = lst
      .map((d: string) => {
        return `base:${d}`;
      })
      .join(", ");

    if (lst.length !== 0) {
      return [`FILTER ( ?con IN ( ${values} ) )`, pred];
    } else {
      return ["", pred];
    }
  };

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
  const translateOptional =
    searchOptions.translate !== "none"
      ? `OPTIONAL { ?uri skosxl:prefLabel ?label2 .
    ?label2 skosxl:literalForm ?translate .
    FILTER ( langmatches(lang(?translate), "${searchOptions.translate}") ) }`
      : "";

  const subqueryTemplate = (
    subqueries,
    match: Matching | "all" | "allPatterns",
    where: string
  ) => {
    const subquery = `
        {
          SELECT ?label ?literal ?l ?context (?sc + ${
            subqueries(match)?.score
          } as ?score) ?uri ?predicate ${translate}
                 ("${match}" as ?matching)
          WHERE {
            { SELECT * {
                ${where}
                ${subqueries(match)?.filter}
                ?uri ${predFilter} ?label ;
                     ${context()[1]} ?con .
                ${context()[0]}
                ${translateOptional}
              }
              ORDER BY DESC(?score) lcase(?literal)
              LIMIT ${searchOptions.limit}
              OFFSET ${searchOptions.offset?.[match as Matching] || 0}
            }
            ?uri ?predicate ?label .
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
    #log: ${JSON.stringify(searchOptions)}
    ${queryPrefix()}
  
    SELECT DISTINCT ?uri ?predicate ?literal ?score ?context ${translate}
           (group_concat( ?l; separator="," ) as ?lang)
           ?matching
    WHERE {
      GRAPH <urn:x-arq:UnionGraph> {
        { ${subquery}
        }
      }
    }
    GROUP BY ?uri ?predicate ?literal ?score ?matching ?context ${translate}
    ORDER BY DESC(?score) lcase(?literal) DESC(?predicate)
    LIMIT ${searchOptions.limit}`;

  return queryEntries();
}
