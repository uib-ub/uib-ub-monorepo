import executeQuery from '@lib/executeQuery'
import { sqb } from '@lib/sparqlQueryBuilder'
import { itemSparqlQuery } from '@services/sparql/queries'
import { HTTPException } from 'hono/http-exception'

export const getItemData = async (id: string, source: string): Promise<any> => {
  try {
    const query = sqb(itemSparqlQuery, { id });
    const result = await executeQuery(query, source)

    return result;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
}

