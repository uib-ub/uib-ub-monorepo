import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT ?concept1 ?published1 ?p ?concept2 ?published2
  WHERE {
    GRAPH ns:${termbase} {
      ?concept1 skosp:memberOf ?tb .
      OPTIONAL {
        ?concept1 skosp:publisere ?published1 .
      }
      ?concept1 ?p ?concept2 .
      ?concept2 skosp:memberOf ?tb .
      OPTIONAL {
        ?concept2 skosp:publisere ?published2 .
      }
    }
  }
  `;
  return query;
}
