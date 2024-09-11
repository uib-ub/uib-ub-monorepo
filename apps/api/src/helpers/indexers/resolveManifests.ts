import executeQuery from '@lib/executeQuery';
import { sqb } from '@lib/sparqlQueryBuilder';
import { manifestSparqlQuery } from '@services/sparql/queries';

export async function resolveManifests(ids: any, source: string, context: string, type: string): Promise<any> {
  try {
    const promises = ids.map((item: { id: string, identifier: string }) => {
      const query = sqb(manifestSparqlQuery, { id: item.id });
      executeQuery(query, source)
    })
    const data = await Promise.all(promises);
    return data;
  } catch (error) {
    // Handle the error here
    console.error(error);
    throw error;
  }
}