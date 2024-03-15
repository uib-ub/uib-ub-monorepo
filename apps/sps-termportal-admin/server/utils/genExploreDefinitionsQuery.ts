import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {

  const query = `
  ${prefix}

  SELECT ?concept ?pred2 ?defValue ?lang WHERE {
    GRAPH ns:${termbase} {
      ?concept skosno:definisjon ?def .
      ?def rdfs:label ?defValue .
      BIND ( lang(?defValue) as ?lang ) .
    }
  }
  LIMIT 500
  `;
  return query;
}
