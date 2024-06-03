import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { sqb } from '@helpers/sparqlQueryBuilder'
import jsonld from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'
import { listItemsSparqlQuery } from '../queries'

export async function getItems(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  const query = sqb(listItemsSparqlQuery, { page: `${page * limit}`, limit: `${limit}` });

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
