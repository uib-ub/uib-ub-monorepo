import { env } from '@/env';
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
PREFIX bibo: <http://purl.org/ontology/bibo/>

JSON {
  "id": ?uri,
  "identifier": ?id 
} WHERE { 
SERVICE <cache:> { 
  SELECT ?uri ?id WHERE 
    { 
      VALUES ?types { bibo:Collection }
      ?uri rdf:type ?types ;
      dct:identifier ?id .
      FILTER(STRENDS(STR(?uri), LCASE(?id))) .
    }
    ORDER BY ?id
    OFFSET %page
    LIMIT %limit
  } 
}`

export const fetchSetsList = async (page: number, limit: number): Promise<InputItem[]> => {
  const response = await fetch(`${env.SPARQL_CHC_ENDPOINT}?query=${encodeURIComponent(sqb(query, { page, limit }))}&output=json`)
  return response.json();
};