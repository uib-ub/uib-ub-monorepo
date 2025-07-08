import { endpointUrl } from '@/clients/sparql-chc-client';

const query = `
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>

  SELECT (count(?uri) as ?count) WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri WHERE 
        { 
          VALUES ?types { foaf:Person ubbont:Cataloguer }
          ?uri rdf:type ?types ;
            dct:identifier ?id .
          FILTER(STRENDS(STR(?uri), LCASE(?id))) .
        }
    }
  }
`

export const fetchPeopleCount = async (): Promise<number> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(query)}&output=json`)
  const data = await response.json();
  return data.results.bindings[0].count.value;
};