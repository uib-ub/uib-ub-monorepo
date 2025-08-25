import { prefix } from "termportal-ui/utils/utils";

export default function (termbase: string) {
  const runtimeConfig = useRuntimeConfig();
  const query = `
  ${prefix}
  PREFIX wiki: <${runtimeConfig.public.base}>

  SELECT ?concept
         ?published
         ?noteType
         ?note 
  WHERE {
    {
      GRAPH <urn:x-arq:UnionGraph> {
        ?concept skosp:memberOf wiki:${termbase}-3A${termbase} .
        OPTIONAL {
          ?concept skosp:publisere ?published .
        }
        {
          ?concept skos:scopeNote ?note .
          BIND ("begrep" as ?noteType) .
        } UNION
        {
          ?concept skosxl:prefLabel/skos:note ?note .
          BIND ("begrep/anbefaltTerm" as ?noteType) .
        } UNION
        {
          ?concept skosxl:altLabel/skos:note ?note .
          BIND ("begrep/tillattTerm" as ?noteType) .
        } UNION
        {
          ?concept skosxl:hiddenLabel/skos:note ?note .
          BIND ("begrep/fraraadetTerm" as ?noteType) .
        } UNION
        {
          ?concept skosno:definisjon/skos:scopeNote ?note .
          BIND ("begrep/definisjon" as ?noteType) .
        } UNION
        {
          ?concept skosp:hasEquivalenceData/skos:note ?note .
          BIND ("begrep/ekvivalens" as ?noteType) .
        } UNION
        {
          ?concept skosp:notation/skos:note ?note .
          BIND ("begrep/bilde-symbol" as ?noteType) .
        }
      }
    }
  }
  `;
  return query;
}
