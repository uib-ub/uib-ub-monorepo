import { endpointUrl } from '../../shared/clients/sparql-chc-client';
import { sqb } from '@shared/utils/sparqlQueryBuilder';

export type InputItem = {
  id: string
  identifier: string
}


const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ore: <http://www.openarchives.org/ore/terms/>

JSON {
  "id": ?uri,
  "identifier": ?id 
} WHERE { 
SERVICE <cache:> { 
  SELECT ?uri ?id WHERE 
      { 
        ?uri rdf:type ore:Aggregation ;
          rdfs:label ?id .
      }
    ORDER BY ?id
    OFFSET %page
    LIMIT %limit
  } 
}`

export const fetchFilesetsList = async (page: number, limit: number): Promise<InputItem[]> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { page, limit }))}&output=json`)
  return response.json();
};