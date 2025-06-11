import { endpointUrl } from '@/clients/sparql-chc-client';

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ore: <http://www.openarchives.org/ore/terms/>

SELECT (COUNT(?uri) as ?count) WHERE { 
SERVICE <cache:> { 
  SELECT ?uri WHERE 
    { 
      ?uri rdf:type ore:Aggregation ;
    }
  } 
}`

export const fetchFilesetsCount = async (): Promise<number> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(query)}&output=json`)
  const data = await response.json();
  return data.results.bindings[0].count.value;
};