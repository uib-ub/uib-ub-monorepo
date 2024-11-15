import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT ?concept
  WHERE {
    GRAPH ns:${termbase} {
      ?concept a skos:Concept .
      FILTER NOT EXISTS {
        ?concept skosno:definisjon ?definition .
      }
    }
  }
  ORDER BY ?concept
  LIMIT 5000
  `;
  return query;
}
