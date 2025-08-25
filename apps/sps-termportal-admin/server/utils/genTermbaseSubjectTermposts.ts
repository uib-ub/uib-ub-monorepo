import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT
    ?concept
    ( GROUP_CONCAT(DISTINCT ?subject; SEPARATOR="||") AS ?subjects )
    ?published
  WHERE {
    GRAPH ns:${termbase} {
      ?concept skosp:memberOf ?tb .
      ?concept skosp:publisere ?published .
      OPTIONAL {
        ?concept dct:subject ?subject .
      }
    }
  }
  GROUP BY ?concept ?published
  `;
  return query;
}
