/**
 * Prepares the data for bulk indexing in Elasticsearch.
 * 
 * @param data - The data to be prepared for bulk indexing.
 * @param indexName - The name of the index in Elasticsearch.
 * @returns An array of objects containing the index information and the data.
 */
export function flatMapDataForBulkIndexing(data: any, indexName: string) {
  return data.flatMap((item: any) => [
    { index: { _index: indexName, _id: item.id } },
    item
  ]);
}
