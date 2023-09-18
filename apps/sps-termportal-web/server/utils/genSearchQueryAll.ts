import { SearchOptions } from "~/utils/vars";

export function genSearchQueryAll(
  searchOptions: SearchOptions,
  language,
  predFilter,
  context
) {
  const runtimeConfig = useRuntimeConfig();

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
      { SELECT ?uri ?label ?lit (0 as ?sc) ?con ${translate}
        WHERE {
          { 
            SELECT *
            WHERE {
              ?uri ${context[1]} ?con .
              ${context[0]}
            }
          }
          ?uri ${predFilter} ?label .
          ?label skosxl:literalForm ?lit .
          ${languageFilter}
          ${translateOptional}
        }
        ORDER BY lcase(str(?lit))
        LIMIT ${searchOptions.limit}
        OFFSET ${searchOptions.offset?.all || 0}
      }`;

  const outerQuery = `
  #log: ${JSON.stringify(searchOptions)}
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX base: <${runtimeConfig.public.base}>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>

  SELECT DISTINCT ?uri ?predicate ?literal ?samling ?context (0 as ?score)
         (group_concat( ?l; separator="," ) as ?lang)
         ${translate}
         ("all" as ?matching)

  WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      { SELECT ?label ?literal ?l ?uri ?predicate ?samling ?context ${translate}
        WHERE {
          ${innerQuery}
          ?uri skosp:memberOf ?s .
          ?uri ?predicate ?label .
          BIND ( replace(str(?s), "${
            runtimeConfig.public.base
          }", "") as ?samling).
          BIND ( replace(str(?con), "${
            runtimeConfig.public.base
          }", "") as ?context).
          BIND ( lang(?lit) as ?l)
          Bind ( str(?lit) as ?literal)
        }
    }
   }
  }
  GROUP BY ?uri ?predicate ?literal ?samling ?score ?lang ?context ?matching ${translate}
  ORDER BY lcase(?literal) DESC(?predicate)
  `;
  return outerQuery;
}
