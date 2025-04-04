import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { sqb } from '@lib/sparqlQueryBuilder'
import jsonld, { ContextDefinition } from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'
import { SPARQL_PREFIXES } from '@config/constants'

export const listItemsSparqlQuery = `
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
          FILTER(STRENDS(STR(?uri), ?id))
          BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
        }
      ORDER BY ?id
      OFFSET %page
      LIMIT %limit
    }
  }
`

export async function getItems(url: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }
  const useContext = CONTEXTS['https://api.ub.uib.no/ns/ubbont/context.json']

  const query = sqb(listItemsSparqlQuery, { page: `${page * limit}`, limit: `${limit}` });

  try {
    const response = await fetch(
      `${url}${encodeURIComponent(
        query,
      )}&output=nt`,
    )
    const result: unknown = await response.text()
    const json = await jsonld.fromRDF(result as object)
    const data = await jsonld.compact(json, useContext as ContextDefinition)

    return cleanJsonld(data)
  }
  catch (error) {
    console.log(error)
    throw new Error
  }
}
