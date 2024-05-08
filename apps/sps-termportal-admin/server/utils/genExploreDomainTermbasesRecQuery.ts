import { prefix } from "termportal-ui/utils/utils";

export default function (domain: string) {
  const query = `${prefix}
  PREFIX base: <http://wiki.terminologi.no/index.php/Special:URIResolver/>
  ${prefix}
  
  SELECT ?label (COUNT(DISTINCT ?concept) AS ?concepts)
  WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      base:DOMENE-3A${domain} skos:narrower+ ?subdomain .
      ?concept skosp:domene ?subdomain ;
               skosp:memberOf ?collection .
      ?collection rdfs:label ?label .
      FILTER (lang(?label) = 'nb')
    }
  }
  GROUP BY ?label
`;

  return query;
}
