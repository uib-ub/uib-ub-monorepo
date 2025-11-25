import client, { observeClient } from '../../clients/es-client'
import { CHC_SEARCH_ALIAS, CHC_INDICIES } from '../../constants'
import { HTTPException } from 'hono/http-exception'
import { fetchAndProcessItem } from './fetch-item'

export const ingestItem = async (id: string) => {
  // Finds the current index name in alias and based on the given indicesInAlias object find the latest index.
  const indicesInAlias = await client.indices.getAlias({ name: CHC_SEARCH_ALIAS })
  const currentIndex = Object.keys(indicesInAlias).find(k => k.startsWith(CHC_INDICIES.items))

  if (!currentIndex) {
    throw new Error(`No index found for ${CHC_INDICIES.items}`)
  }

  const response = await fetchAndProcessItem(id)

  try {
    // Search for documents with matching id field
    const searchResult = await client.search({
      index: currentIndex,
      body: {
        query: {
          match: { "id.keyword": id }
        },
        size: 2  // We only need to know if there's more than one
      }
    });

    // Needed to check the number of hits, as the value can be a number or an object. Typescript doesn't like this.
    let numberOfHits = 0
    if (typeof searchResult.hits.total === 'object') {
      numberOfHits = searchResult.hits.total.value
    } else {
      numberOfHits = searchResult.hits.total ?? 0
    }


    if (numberOfHits > 1) {
      // Multiple documents found - this is an error condition
      console.error(`Multiple documents found with id ${id}`);
      throw new HTTPException(409, { message: `Data integrity error: Multiple documents found with id ${id}` });
    }

    let operation = 'Inserted';
    let existingDocId;
    if (numberOfHits === 1) {
      // Document exists, we'll replace it
      operation = 'Replaced';
      existingDocId = searchResult.hits.hits[0]._id;
    }

    // Use the index API to replace the document or create a new one
    await client.index({
      index: currentIndex,
      id: existingDocId,
      body: response,
      pipeline: 'chc-pipeline'
    });

    console.log({ status: 'ok', message: `${operation} document with id ${id}` });
  } catch (err) {
    console.error('Error replacing/inserting document:', err);
  }
}
