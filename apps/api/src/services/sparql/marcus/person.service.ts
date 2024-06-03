import fetch from '@helpers/fetchRetry'
import { sqb } from '@helpers/sparqlQueryBuilder'
import { personOrGroupSparqlQuery } from '@services/sparql/queries'
import { JSONArray, JSONObject } from 'hono/utils/types'
import jsonld from 'jsonld'

async function getPersonData(id: string, source: string): Promise<JSONArray | JSONObject> {
  const query = sqb(personOrGroupSparqlQuery, { id, class: 'foaf:Person' })

  const url = `${source}${encodeURIComponent(query)}&output=nt`

  try {
    const response = await fetch(url)
    const results: unknown = await response.text()

    if (!results) {
      throw new Error('ID not found, or the object have insufficient metadata')
    }

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const data = await jsonld.fromRDF(results as object)

    return data
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default getPersonData