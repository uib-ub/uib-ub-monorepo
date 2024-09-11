import fetch from '@lib/fetchRetry'
import { sqb } from '@lib/sparqlQueryBuilder'
import { toFileSetTransformer } from '@transformers/file_set.transformer'
import { HTTPException } from 'hono/http-exception'
import jsonld from 'jsonld'
import ubbontContext from 'jsonld-contexts/src/ubbontContext'
import { JsonLd } from 'jsonld/jsonld-spec'
import { filesetSparqlQuery } from '../queries'

export async function fileSetService(id: string, source: string): Promise<JsonLd> {
  const query = sqb(filesetSparqlQuery, { id })
  const url = `${source}${encodeURIComponent(query)}&output=nt`

  try {
    const response = await fetch(url)
    const results: unknown = await response.text() // We get the data as NTriples

    if (!results) {
      return {
        error: true,
        message: 'ID not found.'
      }
    }

    // We get the data as NTriples, so we need to convert it to JSON-LD
    const json = await jsonld.fromRDF(results as object)

    const data = await toFileSetTransformer(json, ubbontContext)
    return data;
  } catch (error) {
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' });
  }
}
