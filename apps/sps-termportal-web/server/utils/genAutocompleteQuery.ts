import { SearchOptions } from "../../utils/vars";
import { sanitizeTerm, getContextFilter } from "./genSearchEntryQuery";
import { genTQLangArgument, genTQGraphValue } from "./genQueryUtils";

export function genAutocompleteQuery(
  searchOptions: SearchOptions,
  base: string
): string {
  const term = searchOptions.term;
  const sanitizedLit = term.replaceAll('"', '\\"');
  const sanitizedIndex = sanitizeTerm(term);
  const multiIndex = sanitizedIndex.split(" ").join(" AND ");
  const lang = genTQLangArgument(searchOptions.language)[0];
  const graph = genTQGraphValue(searchOptions.termbase)[0];
  const context = getContextFilter(searchOptions);
  const contextFilter = () => {
    if (context[0]) {
      const data = `
          ?c skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?l .
          ?c ${context[1]} ?con .
          ${context[0]}`;
      return data;
    } else {
      return "";
    }
  };

  /**
   * Relevance
   * - exact match, case sensitive
   * - exact match, case insensitive
   * - term begins with
   * - subwords begin with
   */
  const query = `
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
  PREFIX base: <${base}>

  SELECT * {
  GRAPH <urn:x-arq:UnionGraph> {
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ( "\\"${sanitizedIndex}\\"" ${lang} ) .
          ${contextFilter()}
          BIND ( str(?lit) as ?litstr )
          FILTER ( ?litstr = "${sanitizedLit}" )
        }
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("\\"${sanitizedIndex}\\"" ${lang}) .
          ${contextFilter()}
          BIND ( str(?lit) as ?litstr )
          FILTER ( lcase(?litstr) = lcase("${sanitizedLit}")
                   && ?litstr != "${sanitizedLit}"
                 )
        }
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("${multiIndex}*" ${lang}) .
          ${contextFilter()}
          BIND ( str(?lit) as ?litstr )
          FILTER ( strStarts( lcase(?litstr), lcase("${sanitizedLit}") ) &&
                   lcase(?litstr) != lcase("${sanitizedLit}")
                 )
        }
        ORDER by lcase(?litstr)
        LIMIT 20
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("${multiIndex}*" ${lang}) .
          ${contextFilter()}
          BIND ( str(?lit) as ?litstr )
          FILTER ( !strStarts( lcase(?litstr), lcase("${sanitizedLit}") )
                   && contains( ?litstr, lcase("${sanitizedLit}") )
                 )
        }
        ORDER by ?litstr
        LIMIT 20
      }
    }
  }
  LIMIT 20
`;
  return query;
}
