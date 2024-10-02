import { observeClient } from '@config/apis/esClient';
import jsonld from 'jsonld';
import { JsonLd } from 'jsonld/jsonld-spec';
import { uniqueId } from 'lodash';

async function executeQuery(query: string, source: string): Promise<JsonLd | { error: boolean; message: string }> {
  const url = `${source}${encodeURIComponent(query)}&output=nt`

  try {
    const response = await fetch(url)
    const results: unknown = await response.text()

    if (!results) {
      return {
        error: true,
        message: 'No results found or insufficient metadata'
      }
    }

    const data = await jsonld.fromRDF(results as object)
    return data

  } catch (error) {
    console.error(error);
    //throw new HTTPException(500, { message: 'Internal Server Error' });
    observeClient.index({
      index: 'logs-chc',
      body: {
        '@timestamp': new Date(),
        message: `id: ${uniqueId()}, issues: ${JSON.stringify(error)}`
      }
    })
  }
}

export default executeQuery;