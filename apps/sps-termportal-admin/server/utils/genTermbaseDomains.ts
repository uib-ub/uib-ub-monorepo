import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const runtimeConfig = useRuntimeConfig();
  const query = `
  ${prefix}
  PREFIX wiki: <${runtimeConfig.public.base}>

  SELECT ?domain ?domainLiteral (COUNT(?concept) as ?count) WHERE {
    {
      GRAPH <urn:x-arq:UnionGraph> {
        ?concept skosp:memberOf wiki:${termbase}-3A${termbase} .
        ?concept skosp:domene ?domain .
        ?domain skosxl:prefLabel ?domainLabel .
        ?domainLabel skosxl:literalForm ?domainLiteral .
        FILTER ( lang(?domainLiteral) = "nb" ) .
      }
    }
  }
  GROUP BY ?domain ?domainLiteral
  `;
  return query;
}
