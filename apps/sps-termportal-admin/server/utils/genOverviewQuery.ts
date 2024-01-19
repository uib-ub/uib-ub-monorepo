import { prefix } from "termportal-ui/utils/utils";

export default function () {
  const query = `
  ${prefix}

  SELECT ?id ?label (count(?concept) as ?concepts) WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      ?concept skosp:memberOf ?tb .
      ?tb dct:identifier ?id .
      ?tb rdfs:label ?label .
      FILTER ( lang(?label) = 'nb') .
    }
  }
  GROUP BY ?id ?label
  ORDER BY ?label
  `;
  return query;
}
