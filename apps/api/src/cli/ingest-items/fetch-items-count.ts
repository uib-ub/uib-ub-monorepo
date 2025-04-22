import { endpointUrl } from '../../shared/clients/sparql-chc-client';

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ubbont: <http://data.ub.uib.no/ontology/>
PREFIX bibo: <http://purl.org/ontology/bibo/>

SELECT (COUNT(?uri) as ?count) WHERE { 
SERVICE <cache:> { 
  SELECT ?uri WHERE 
    { 
      ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
        ubbont:showWeb true ;
        dct:identifier ?id .
      FILTER(STRENDS(STR(?uri), ?id))
    }
  } 
}`

export const fetchItemsCount = async (): Promise<number> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(query)}&output=json`)
  const data = await response.json();
  return data.results.bindings[0].count.value;
};