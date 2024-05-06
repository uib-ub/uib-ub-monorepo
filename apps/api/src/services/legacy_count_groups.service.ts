import { DATA_SOURCES } from '../config/constants'
import fetch from '../helpers/fetchRetry'

const query = `
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>

  SELECT (count(?uri) as ?total) WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri WHERE 
        { 
          VALUES ?types { <http://xmlns.com/foaf/0.1/Organization> <http://dbpedia.org/ontology/Company> <http://data.ub.uib.no/ontology/Publisher> <http://data.ub.uib.no/ontology/Family>}
          ?uri a ?types ;
            dct:identifier ?id .
        }
    }
  }
`

export async function countPeople(source: string): Promise<any> {
  const SERVICE = DATA_SOURCES.filter((service) => service.name === source)[0].url
  const url = `${SERVICE}${encodeURIComponent(query)}&output=json`
  try {
    const response = await fetch(url)
    const data = await response.json()

    return parseInt(data.results.bindings[0].total.value)
  } catch (error) {
    console.error(error);
    throw error;
  }
}
