import { DATA_SOURCES } from '@config/constants'
import fetch from '@helpers/fetchRetry'
import { sqb } from '@helpers/sparqlQueryBuilder'
import { countSubClassOfSparqlQuery } from '@services/sparql/queries'


export async function countItems(source: string): Promise<any> {
  const query = sqb(countSubClassOfSparqlQuery, { type: 'bibo:Document' })

  const SERVICE = DATA_SOURCES.filter((service) => service.name === source)[0].url
  const url = `${SERVICE}${encodeURIComponent(query)}&output=json`
  try {
    const response = await fetch(url)
    const data = await response.json()

    return parseInt(data.results.bindings[0].total.value)
  } catch (error) {
    console.error(error);
    throw error;
  }
}
