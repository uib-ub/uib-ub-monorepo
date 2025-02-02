export default function (namespace: string): string {
  const runtimeConfig = useRuntimeConfig();

  const query = `
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
PREFIX base: <${runtimeConfig.public.base}>
  
CONSTRUCT  {
  base:${namespace}-3A${namespace} ?p ?o.
  ?o ?p2 ?o2.}
WHERE {
  GRAPH ?G {
    {
      base:${namespace}-3A${namespace} ?p ?o.
      OPTIONAL {?o ?p2 ?o2.}
      FILTER (?p NOT IN (skos:member) )
      FILTER NOT EXISTS {
        ?o a skos:Concept
      }
    }
  }
}
`;
  return query;
}
