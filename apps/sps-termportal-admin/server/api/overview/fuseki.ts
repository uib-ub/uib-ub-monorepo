export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.endpointUrl;

  const query = `
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX text: <http://jena.apache.org/text#>
  PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX skosp: <http://www.data.ub.uib.no/ns/spraksamlingene/skos#>
  PREFIX skosno: <https://data.norge.no/vocabulary/skosno#>
  PREFIX skosno: <https://vokab.norge.no/skosno#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
 
  SELECT ?id ?label (count(?concept) as ?concepts) WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      ?concept skosp:memberOf ?tb .
      ?tb dct:identifier ?id .
      ?tb rdfs:label ?label .
      
      FILTER ( lang(?label) = 'nb') .
    }
  }
  GROUP BY ?id ?label
  ORDER BY ?label
   `;

  const data = await $fetch(url, {
    method: "post",
    body: query,
    headers: {
      "Content-type": "application/sparql-query",
      Referer: "termportalen.no", // TODO Referer problem
      Accept: "application/json",
    },
  });

  setResponseHeaders(event, {
    //"Cache-Control": "public, max-age=1200",
  });

  return data;
});
