import { SPARQL_PREFIXES } from '@config/constants'
import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import jsonld from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'

function getQuery(page = 0, limit = 100) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri a ?class ; 
        dct:identifier ?id ;
        ubbont:isDigitized ?isDigitized .
    } WHERE { 
      SERVICE <cache:> { 
        SELECT ?uri ?class ?id ?isDigitized WHERE 
          { 
            ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
              a ?class ;
              ubbont:showWeb true ;
              dct:identifier ?id .
            BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
          }
        ORDER BY ?id
        OFFSET ${page * limit}
        LIMIT ${limit}
      }
    }
  `
  return query
}


export async function getItems(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]
  const query = getQuery(page, limit)

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
