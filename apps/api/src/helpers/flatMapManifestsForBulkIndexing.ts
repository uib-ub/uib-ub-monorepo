import { randomUUID } from 'crypto';

/**
 * Prepares the data for bulk indexing in Elasticsearch.
 * 
 * @param data - The data to be prepared for bulk indexing.
 * @param indexName - The name of the index in Elasticsearch.
 * @returns An array of objects containing the index information and the data.
 */
export function flatMapManifestsForBulkIndexing(data: any, indexName: string) {
  //console.log("🚀 ~ file: ingester.js:55 ~ prepareData ~ data:", data)
  // create an array of index objects with the id
  const items = data.map(({ identifier, id }: { identifier: string, id: string }) => ({
    index: {
      _index: indexName,
      _id: identifier || id || `error:${randomUUID()}`
    }
  }));

  // create an array of objects with the id and the data
  const body = items.flatMap((item: any, i: number) => [
    item, {
      id: data[i].identifier ?? `missing ID`,
      label: data[i].label,
      manifest: data[i]
    }
  ]);
  // console.log("🚀 ~ file: ingester.js:67 ~ prepareData ~ body:", body)
  return body;
}