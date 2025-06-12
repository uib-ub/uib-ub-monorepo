import { endpointUrl } from '@/clients/sparql-chc-client';
import { sqb } from 'utils';

export type InputItem = {
  id: string
  identifier: string
}

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ore: <http://www.openarchives.org/ore/terms/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ubbont: <http://data.ub.uib.no/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX dbo: <http://dbpedia.org/ontology/>

JSON {
  "id": ?uri,
  "identifier": ?id 
} WHERE { 
SERVICE <cache:> { 
  SELECT ?uri ?id WHERE 
    { 
      VALUES ?types { foaf:Organization ubbont:Family dbo:Company }
      ?uri rdf:type ?types ;
      dct:identifier ?id .
    }
    ORDER BY ?id
    OFFSET %page
    LIMIT %limit
  } 
}`

export const fetchGroupsList = async (page: number, limit: number): Promise<InputItem[]> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { page, limit }))}&output=json`)
  return response.json();
};