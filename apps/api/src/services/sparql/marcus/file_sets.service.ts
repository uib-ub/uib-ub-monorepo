import { cleanJsonld } from '@helpers/cleaners/cleanJsonLd'
import { sqb } from '@lib/sparqlQueryBuilder'
import jsonld from 'jsonld'
import { CONTEXTS } from 'jsonld-contexts'
import { listFileSetsSparqlQuery } from '../queries'
import { fileSetService } from './file_set.service'

export async function getFileSets(url: string, context: string, page?: number, limit?: number): Promise<any> {
  if (!url) { throw Error }
  const useContext = CONTEXTS[context as keyof typeof CONTEXTS]

  const query = sqb(listFileSetsSparqlQuery, { page: `${page * limit}`, limit: `${limit}` });

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

export async function resolveFileSets(ids: any, source: string): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, identifier: string }) => fileSetService(item.identifier, source))
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}