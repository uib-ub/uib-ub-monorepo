import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT ?concept1 ?published1 ?p ?concept2 ?published2
  WHERE {
    GRAPH ns:${termbase} {
      ?concept1 a skos:Concept .
      ?concept2 a skos:Concept .
      ?concept1 ?p ?concept2 .
      FILTER(?p IN (
        skos:semanticRelation,
        skos:broader,
        skos:narrower,
        skos:related,
        xkos:specializes,
        xkos:generalizes,
        xkos:isPartOf,
        xkos:hasPart,
        rdfs:seeAlso
        )
    )

      OPTIONAL {
        ?concept1 skosp:publisere ?published1 .
      }
      OPTIONAL {
        ?concept2 skosp:publisere ?published2 .
      }
    }
  }
  `;
  return query;
}
