import { SearchOptions } from "~/utils/vars";

export function genSearchQueryAll(
  searchOptions: SearchOptions,
  graph,
  language,
  predFilter
) {
  let languageFilter: string;
  if (language[0] === "") {
    languageFilter = "";
  } else {
    const languageFilterExp = language
      .map((lang) => `langmatches(lang(?lit), '${lang}')`)
      .join("     \n || ");
    languageFilter = `FILTER ( ${languageFilterExp} )`;
  }

  const translate = searchOptions.translate !== "none" ? "?translate" : "";
  const translateOptional =
    searchOptions.translate !== "none"
      ? `OPTIONAL { ?uri skosxl:prefLabel ?label2 .
                     ?label2 skosxl:literalForm ?translate .
                     FILTER ( langmatches(lang(?translate), '${searchOptions.translate}') ) }`
      : "";

  const innerQuery = `
      { SELECT ?uri ?predicate ?label ?lit (0 as ?sc) ?s ${translate}
        WHERE {
          GRAPH ${graph[1]} {
            ?label skosxl:literalForm ?lit.
            ${languageFilter}
            ${predFilter}
            ?uri ?predicate ?label;
                 skosp:memberOf ?s.
            ${translateOptional}
          }
        }
        ORDER BY lcase(str(?lit))
        LIMIT ${searchOptions.limit}
        OFFSET ${searchOptions.offset?.all || 0}
      }`;

  const outerQuery = `
  #log: ${JSON.stringify(searchOptions)}
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>

  SELECT DISTINCT ?uri ?predicate ?literal ?samling (0 as ?score)
         (group_concat( ?l; separator="," ) as ?lang)
         ("all" as ?matching) ${translate}
  ${graph[0]}
  WHERE {
      { SELECT ?label ?literal ?l ?uri ?predicate ?samling ${translate}
        WHERE {
          ${innerQuery}
          BIND ( replace(str(?s), "http://.*wiki.terminologi.no/index.php/Special:URIResolver/.*-3A", "") as ?samling).
          BIND ( lang(?lit) as ?l)
          Bind ( str(?lit) as ?literal)
        }
        ORDER BY lcase(?literal)
        LIMIT ${searchOptions.limit}
    }
  }
  GROUP BY ?uri ?predicate ?literal ?samling ?score ?lang ?matching ${translate}
  ORDER BY lcase(?literal) DESC(?predicate)
  LIMIT ${searchOptions.limit}
  `;

  return outerQuery;
}
