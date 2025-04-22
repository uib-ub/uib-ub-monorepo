import { endpointUrl } from '../../shared/clients/sparql-chc-client';
import { sqb } from '@shared/utils/sparqlQueryBuilder';

export type InputItem = {
  id: string
  identifier: string
}

const query = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ubbont: <http://data.ub.uib.no/ontology/>
PREFIX bibo: <http://purl.org/ontology/bibo/>

JSON {
  "id": ?uri,
  "identifier": ?id 
} WHERE { 
SERVICE <cache:> { 
  SELECT ?uri ?id WHERE 
    { 
      ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
        ubbont:showWeb true ;
        dct:identifier ?id .
      FILTER(STRENDS(STR(?uri), ?id))
    }
  ORDER BY ?id
  OFFSET %page
  LIMIT %limit
  } 
}`

export const fetchItemsList = async (page: number, limit: number): Promise<InputItem[]> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { page, limit }))}&output=json`)
  return response.json();
};