import { samlingMapping, prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const namespace = samlingMapping[termbase];

  const query = `
  ${prefix}

  SELECT ?concept (GROUP_CONCAT(?relation; separator=";") AS ?relations)
  WHERE {
    GRAPH ns:${namespace} {
      ?concept skos:semanticRelation ?relation .
    }
  }
  GROUP BY ?concept
  LIMIT 1000
  `;
  return query;
}
