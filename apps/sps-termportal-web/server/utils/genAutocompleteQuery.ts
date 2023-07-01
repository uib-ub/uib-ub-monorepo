import { SearchOptions } from "../../utils/vars";
import { samlingMapping, sanitizeTerm } from "./genSearchQuery";

export function genAutocompleteQuery(
  searchOptions: SearchOptions,
  base: string
): string {
  const term = () => {
    return searchOptions.term;
  };
  const sanitized = () => {
    return sanitizeTerm(term());
  };

  const lang = () => {
    const langopt = searchOptions.language[0];
    if (langopt === "all") {
      return "";
    } else {
      return `'lang:${langopt}'`;
    }
  };

  const graph = () => {
    const tbopt = searchOptions.termbase[0];
    if (tbopt === "all") {
      return "<urn:x-arq:UnionGraph>";
    } else {
      return `ns:${samlingMapping[tbopt]}`;
    }
  };

  const domain = () => {
    const domainopt = searchOptions.domain;

    if (searchOptions.termbase[0] === "all" && domainopt[0] !== "all") {
      const domains = domainopt
        .map((d) => {
          return "base:" + d;
        })
        .join("|");
      return `?c skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?l .
      # ?c skosp:domene|skosp:domeneTransitive ${domains} .`;
    } else {
      return "";
    }
  };

  const query = `#log: ${JSON.stringify(searchOptions)}
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
  PREFIX base: <${base}>

  SELECT * {
  GRAPH ${graph()} {
      SELECT DISTINCT ?litstr {
        ( ?l ?sc ?lit ) text:query ("${sanitized()}*" ${lang()}) .
        ${domain()}
        BIND ( str(?lit) as ?litstr )
        FILTER (strStarts(lcase(?litstr), lcase("${term()}")))
      }
    }
  }
  ORDER by ?litstr
  LIMIT 20
`;

  return query;
}
