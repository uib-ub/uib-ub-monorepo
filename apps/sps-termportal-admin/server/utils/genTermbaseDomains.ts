import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const runtimeConfig = useRuntimeConfig();
  const query = `
  ${prefix}
  PREFIX wiki: <${runtimeConfig.public.base}>

  SELECT ?id
         (COUNT(?concept) as ?count)
         (GROUP_CONCAT(DISTINCT ?parentId; SEPARATOR=", ") AS ?parents)
  WHERE {
    {
      GRAPH <urn:x-arq:UnionGraph> {
        ?concept skosp:memberOf wiki:${termbase}-3A${termbase} .
        ?concept skosp:domene ?domain .
        ?domain skos:broader+ ?parent .
        BIND ( REPLACE(STR(?parent), "${runtimeConfig.public.base}DOMENE-3A", "") as ?parentId )
        BIND ( REPLACE(STR(?domain), "${runtimeConfig.public.base}DOMENE-3A", "") as ?id ) .
      }
    }
  }
  GROUP BY ?id
  `;
  return query;
}
