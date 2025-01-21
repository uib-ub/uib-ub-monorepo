import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const query = `
  ${prefix}

  SELECT ?subject (COUNT(?subject) as ?count) WHERE {
    GRAPH ns:${termbase} {
      ?concept skosp:memberOf ?tb .
      ?concept dct:subject ?subject .
    }
  }
  GROUP BY ?subject
  `;
  return query;
}
