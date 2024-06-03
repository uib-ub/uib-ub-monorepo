import { SPARQL_PREFIXES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { sqb } from '@helpers/sparqlQueryBuilder'
import jsonld from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'
import { listSubClassOfSparqlQuery } from '../queries'

function getQuery(page = 0, limit = 100) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri dct:identifier ?id ;
    } WHERE { 
      SERVICE <cache:> { 
        SELECT ?uri ?id WHERE 
          { 
            ?uri rdf:type/rdfs:subClassOf* foaf:Person ;
              dct:identifier ?id .
          }
        ORDER BY ?id
        OFFSET ${page * limit}
        LIMIT ${limit}
      }
    }
  `
  return query
}


export async function getPeople(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  const query = sqb(listSubClassOfSparqlQuery, { type: 'foaf:Person', types: 'foaf:Person', page: `${page * limit}`, limit: `${limit}` });

  try {
    const response = await fetch(
      `${url}${encodeURIComponent(
        query,
      )}&output=nt`,
    )
    const result: unknown = await response.text()
    const json = await jsonld.fromRDF(result as object)
    const data = await jsonld.compact(json, useContext)

    return cleanJsonld(data)
  }
  catch (error) {
    console.log(error)
    throw new Error
  }
}
