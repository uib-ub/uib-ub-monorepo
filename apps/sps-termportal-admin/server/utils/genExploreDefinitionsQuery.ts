import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {

  const query = `
  ${prefix}

  SELECT ?concept ?defValue ?lang WHERE {
    GRAPH ns:${termbase} {
      ?concept skosno:definisjon ?def .
      ?def rdfs:label ?defValue .
      BIND ( lang(?defValue) as ?lang ) .
    }
  }
  LIMIT 1000
  `;
  return query;
}
