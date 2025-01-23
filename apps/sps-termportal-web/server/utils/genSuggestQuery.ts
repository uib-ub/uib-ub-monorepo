import type { SearchOptions } from "../../utils/vars";
import { sanitizeTerm } from "./genSearchEntryQuery";
import { genTQLangArgument, genTQGraphValue } from "./genQueryUtils";

export function genSuggestQuery(
  searchOptions: SearchOptions,
  base: string
): string {
  const term = searchOptions.term;
  const sanitizedIndex = sanitizeTerm(term);
  const sanitizedFuzzy = sanitizedIndex.split(" ").map((t) => {
    return t + "~2";
  });
  const multiIndex = sanitizedFuzzy.join(" AND ");
  const lang = genTQLangArgument(searchOptions.language)[0];
  const graph = genTQGraphValue(searchOptions.termbase)[0];
  const domain =
    searchOptions.termbase[0] !== "all"
      ? genDomainTriple(searchOptions.domain)
      : "";

  const query = `
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
  PREFIX base: <${base}>

  SELECT DISTINCT ?lit ?sc {
  GRAPH ${graph} {
      {
          ( ?l ?sc ?lit ) text:query ( "${multiIndex}" ${lang} ) .
          ${domain}
      }
    }
  }
  ORDER BY DESC(?sc)
  LIMIT 10
`;

  return query;
}
