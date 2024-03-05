import client from '../config/apis/esClient';

export async function indexData(data: any, indexName: string) {
  if (data.length === 0) return `No data to ingest into ${indexName}`;
  //console.log("🚀 ~ file: ingester.service.ts:305 ~ indexData ~ data:", data)

  try {
    // @ts-ignore
    const response: BulkIndexResponse = await client.bulk({
      refresh: true,
      body: data,
      pipeline: 'cho-demo-pipeline'
    });

    const errors = response.items.filter((item: any) => item.index.error).map((item: any) => {
      return `Error indexing item ${item.index._id}: ${JSON.stringify(item.index.error)}`;
    })

    if (errors.length > 0) console.warn(errors)

    return {
      count: response.items.length,
      errors: errors ?? []
    }
  }
  catch (error) {
    console.warn("🚀 ~ file: ingester.js:96 ~ indexData ~ error", error)
  }
}