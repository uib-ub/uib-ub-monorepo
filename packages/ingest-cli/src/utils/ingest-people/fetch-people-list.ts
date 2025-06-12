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

JSON {
  "id": ?uri,
  "identifier": ?id 
} WHERE { 
SERVICE <cache:> { 
  SELECT ?uri ?id WHERE 
    { 
      VALUES ?types { foaf:Person ubbont:Cataloguer }
      ?uri rdf:type ?types ;
      dct:identifier ?id .
      filter(?id not in ("c7d90ba5-d26b-4adc-9d36-163f8a23b26a","cf8c4202-74ea-43f2-b472-a702c62dbc5d", "Runar Jordåen","Bastian Danielsen", "Heidi Rafto" ))
    }
    ORDER BY ?id
    OFFSET %page
    LIMIT %limit
  } 
}`

export const fetchPeopleList = async (page: number, limit: number): Promise<InputItem[]> => {
  const response = await fetch(`${endpointUrl}?query=${encodeURIComponent(sqb(query, { page, limit }))}&output=json`)
  return response.json();
};