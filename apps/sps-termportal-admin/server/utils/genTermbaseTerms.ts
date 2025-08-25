import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT
    ?concept
    ?published
    ( GROUP_CONCAT(DISTINCT ?prefLabel; SEPARATOR="||") AS ?prefLabels )
    ( GROUP_CONCAT(DISTINCT ?altLabel; SEPARATOR="||") AS ?altLabels )
    ( GROUP_CONCAT(DISTINCT ?hiddenLabel; SEPARATOR="||") AS ?hiddenLabels )
  WHERE {
    GRAPH ns:${termbase} {
      ?concept skosp:memberOf ?tb .
      OPTIONAL {
        ?concept skosp:publisere ?published .
      }
      OPTIONAL {
        ?concept skosxl:prefLabel/skosxl:literalForm ?prefLabelLit .
        FILTER (lang(?prefLabelLit) IN ('nb', 'nn', 'en') ) .
        BIND ( CONCAT(str(?prefLabelLit), " (", lang(?prefLabelLit), ")" ) AS ?prefLabel) .
      }
      OPTIONAL {
        ?concept skosxl:altLabel/skosxl:literalForm ?altLabelLit .
        FILTER (lang(?altLabelLit) IN ('nb', 'nn', 'en') ) .
        BIND ( CONCAT(str(?altLabelLit), " (", lang(?altLabelLit), ")" ) AS ?altLabel) .
      }
      OPTIONAL {
        ?concept skosxl:hiddenLabel/skosxl:literalForm ?hiddenLabelLit .
        FILTER (lang(?hiddenLabelLit) IN ('nb', 'nn', 'en') ) .
        BIND ( CONCAT(str(?hiddenLabelLit), " (", lang(?hiddenLabelLit), ")" ) AS ?hiddenLabel) .
      }
    }
  }
GROUP BY ?concept ?published
LIMIT 10000
  `;
  return query;
}
