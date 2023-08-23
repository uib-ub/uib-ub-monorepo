import { Matching, LabelPredicate, SearchOptions } from "./vars";

const htmlHighlight = {
  open: "<mark class='tp-shighlight'>",
  close: "</mark>",
};

export function sanitizeTerm(term: string) {
  return term
    .replace(/-|\(|\)|<|>|\[|\]|\/|,\s*$|\*|~|'|"|_/g, " ")
    .replace(/\s\s+/g, " ")
    .replace(/\. /g, " ")
    .replace(/\.$/g, "")
    .trim();
}

export function getTermData(
  term: string,
  highlight: { [key: string]: string }
) {
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

function getPredicateValues(predicate: LabelPredicate[]): string {
  const predLength = predicate.length;
  if (predLength === 0 || predLength === 3) {
    return "";
  } else {
    const filterPred = predicate.map((p) => `skosxl:${p}`).join(" ");
    return `VALUES ?predicate { ${filterPred} }`;
  }
}

export function genSearchEntryQuery(searchOptions: SearchOptions): string {
  const termData = getTermData(searchOptions.term, htmlHighlight);
  const language = getLanguageData(searchOptions.language);
  const predFilter = getPredicateValues(searchOptions.predicate);

  const subqueries = (subEntry: string) => {
    const content = {
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
          SELECT ?label ?literal ?l (?sc + ${
            subqueries(match)?.score
          } as ?score) ?uri ?predicate ?samling ${translate}
                 ("${match}" as ?matching)
          WHERE {
            ${where}
            ${subqueries(match)?.filter}
            ${predFilter}
            ?uri ?predicate ?label;
                 skosp:memberOf ?s.
            ${translateOptional}
            BIND ( lang(?lit) as ?l ).
            BIND ( str(?lit) as ?literal ).
            BIND ( replace(str(?s), "http://.*wiki.terminologi.no/index.php/Special:URIResolver/.*-3A", "") as ?samling).
          }
          ORDER BY DESC(?score) lcase(?literal)
          LIMIT ${searchOptions.limit}
          OFFSET ${searchOptions.offset?.[match as Matching] || 0}
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
    PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>`;

  const queryEntries = () => `
    #log: ${JSON.stringify(searchOptions)}
    ${queryPrefix()}
  
    SELECT DISTINCT ?uri ?predicate ?literal ?samling ?score ${translate}
           (group_concat( ?l; separator="," ) as ?lang)
           ?matching
    WHERE {
      GRAPH <urn:x-arq:UnionGraph> {
        { ${subquery}
        }
      }
    }
    GROUP BY ?uri ?predicate ?literal ?samling ?score ?matching ${translate}
    ORDER BY DESC(?score) lcase(?literal) DESC(?predicate)
    LIMIT ${searchOptions.limit}`;

  return queryEntries();
}
