import fetch from '@helpers/fetchRetry'
import { sqb } from '@helpers/sparqlQueryBuilder'
import { HTTPException } from 'hono/http-exception'
import jsonld from 'jsonld'
import { JsonLd } from 'jsonld/jsonld-spec'
import { manifestSparqlQuery } from '../queries'

export async function manifestService(id: string, source: string): Promise<JsonLd> {
  const query = sqb(manifestSparqlQuery, { id })
  const url = `${source}${encodeURIComponent(query)}&output=nt`

  try {
    const response = await fetch(url)
    const results: unknown = await response.text() // We get the data as NTriples

    if (!results) {
      return {
        error: true,
        message: 'ID not found, or the object have insufficient metadata'
      }
    }

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const data = jsonld.fromRDF(results as object)

    return data
  } catch (error) {
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}
