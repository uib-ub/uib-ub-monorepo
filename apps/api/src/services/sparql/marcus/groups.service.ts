import { SPARQL_PREFIXES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import compactAndFrameNTriples from '@helpers/compactAndFrameNTriples'
import { sqb } from '@helpers/sparqlQueryBuilder'
import { listSparqlQuery } from '../queries'

function getQuery(page = 0, limit = 100) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri a crm:E74_Group ;
        dct:identifier ?id .
    } WHERE { 
      SERVICE <cache:> { 
        SELECT ?uri ?id WHERE 
          { 
            VALUES ?types { <http://xmlns.com/foaf/0.1/Organization> <http://dbpedia.org/ontology/Company> <http://data.ub.uib.no/ontology/Publisher> <http://data.ub.uib.no/ontology/Family>}
            ?uri rdf:type ?types ;
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


export async function getGroups(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }

  //const query = getQuery(page, limit)
  const query = sqb(listSparqlQuery, { type: 'crm:E74_Group', types: '<http://xmlns.com/foaf/0.1/Organization> <http://dbpedia.org/ontology/Company> <http://data.ub.uib.no/ontology/Publisher> <http://data.ub.uib.no/ontology/Family>', page: `${page * limit}`, limit: `${limit}` });
  try {
    console.log("🚀 ~ getGroups ~ query:", query)
    const response = await fetch(
      `${url}${encodeURIComponent(
        query,
      )}&output=nt`,
    )
    const results = await response.text()

    if (!results) {
      return {
        error: true,
        message: 'ID not found, or the object have insufficient metadata'
      }
    }

    const data = await compactAndFrameNTriples(results, context, 'Group')
    return cleanJsonld(data)
  }
  catch (error) {
    console.log(error)
    throw new Error
  }
}
