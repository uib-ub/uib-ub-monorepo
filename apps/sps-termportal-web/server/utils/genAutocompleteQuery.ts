import { SearchOptions } from "../../utils/vars";
import { samlingMapping, sanitizeTerm } from "./genSearchQuery";
import { genTQLangArgument, genTQGraphValue } from "./genQueryUtils";

export function genAutocompleteQuery(
  searchOptions: SearchOptions,
  base: string
): string {
  const term = searchOptions.term;
  const sanitized = sanitizeTerm(term);
  const lang = genTQLangArgument(searchOptions.language)[0];
  const graph = genTQGraphValue(searchOptions.termbase)[0];
  const domain =
    searchOptions.termbase[0] !== "all"
      ? genDomainTriple(searchOptions.domain)
      : "";

  const query = `#log: ${JSON.stringify(searchOptions)}
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
  PREFIX base: <${base}>

  SELECT * {
  GRAPH ${graph} {
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ( "\\"${sanitized}\\"" ${lang} ) .
          ${domain}
          BIND ( str(?lit) as ?litstr )
          FILTER ( ?litstr = "${term}" )
        }
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("\\"${sanitized}\\"" ${lang}) .
          ${domain}
          BIND ( str(?lit) as ?litstr )
          FILTER ( lcase(?litstr) = lcase("${term}")
                   && ?litstr != "${term}"
                  )
        }
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("${sanitized}*" ${lang}) .
          ${domain}
          BIND ( str(?lit) as ?litstr )
          FILTER ( strStarts( lcase(?litstr), lcase("${term}") ) &&
                   lcase(?litstr) != lcase("${term}")
                  )
        }
        ORDER by lcase(?litstr)
        LIMIT 20
      }
      UNION
      {
        SELECT DISTINCT ?litstr {
          ( ?l ?sc ?lit ) text:query ("${sanitized}*" ${lang}) .
          ${domain}
          BIND ( str(?lit) as ?litstr )
          FILTER ( !strStarts( lcase(?litstr), lcase("${term}") ) )
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
