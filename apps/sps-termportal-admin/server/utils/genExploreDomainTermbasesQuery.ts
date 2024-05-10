import { prefix } from "termportal-ui/utils/utils";

export default function (domain: string) {
  const query = `${prefix}
PREFIX base: <http://wiki.terminologi.no/index.php/Special:URIResolver/>

SELECT ?label (COUNT(?concept) AS ?concepts)
WHERE {
  GRAPH <urn:x-arq:UnionGraph> {
    ?concept skosp:domene base:DOMENE-3A${domain} .
    ?concept skosp:memberOf ?collection .
    ?collection rdfs:label ?label .
    FILTER (lang(?label) = 'nb')
  }
}
GROUP BY ?label
`;

  return query;
}
