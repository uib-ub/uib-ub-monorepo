import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const runtimeConfig = useRuntimeConfig();
  const appConfig = useAppConfig();

  const query = `
  ${prefix}
  PREFIX wiki: <${runtimeConfig.public.base}>

SELECT ?id
       (COUNT(DISTINCT ?concept) as ?count)
       (COUNT(DISTINCT ?publishedConcept) as ?publishedCount)
       (COALESCE(GROUP_CONCAT(DISTINCT ?parentId; SEPARATOR=", "), "") AS ?parents)
WHERE {
  {
    GRAPH <urn:x-arq:UnionGraph> {
      ?concept skosp:memberOf wiki:${termbase}-3A${termbase} .
      OPTIONAL { ?concept skosp:domene ?domain }
      BIND ( COALESCE(REPLACE(STR(?domain), "${runtimeConfig.public.base}DOMENE-3A", ""), "${appConfig.domains.noDomainKey}") as ?id ) .

      OPTIONAL {
        ?concept skosp:publisere true .
        BIND(?concept AS ?publishedConcept)
      }

      OPTIONAL {
        ?concept skosp:domene ?domain .
        ?domain skos:broader+ ?parent .
        BIND ( REPLACE(STR(?parent), "${runtimeConfig.public.base}DOMENE-3A", "") as ?parentId )
      }
    }
  }
}
GROUP BY ?id
  `;
  return query;
}
