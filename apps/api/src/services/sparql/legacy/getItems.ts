import { SPARQL_PREFIXES } from '../../../libs/constants'
import compactAndFrameNTriples from '../../../libs/helpers/frameJsonLd'

function getQuery(page = 0, limit = 100) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri dct:identifier ?id .
    } WHERE { 
      SERVICE <cache:> { 
        SELECT ?uri ?id WHERE 
          { 
            ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
              ubbont:showWeb true ;
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


export async function getItems(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }

  const query = getQuery(page, limit)

  try {
    const response = await fetch(
      `${url}${encodeURIComponent(
        query,
      )}&output=nt`,
    )
    const data = await response.text()
    return await compactAndFrameNTriples(data, context)
  }
  catch (error) {
    console.log(error)
  }
}
