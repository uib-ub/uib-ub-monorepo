import client from '../../../clients/es-client';

interface IndexDataResponse {
  count: number;
  errors: string[];
}

interface BulkIndexResponse {
  items: Array<{
    index: {
      _id: string;
      error?: any;
    };
  }>;
}

export async function bulkIndexData(data: any, indexName: string, pipeline?: string): Promise<IndexDataResponse | string> {
  if (data.length === 0) return `No data to ingest into ${indexName}`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // @ts-ignore
      const response: BulkIndexResponse = await client.bulk({
        refresh: 'wait_for',
        body: data,
        pipeline: pipeline ?? undefined,
        timeout: '120s' // Set bulk operation timeout
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
    catch (error: any) {
      retryCount++;
      const isTimeoutError = error.name === 'TimeoutError' || error.message?.includes('timeout');
      
      if (isTimeoutError && retryCount < maxRetries) {
        console.warn(`Timeout error on attempt ${retryCount}/${maxRetries}, retrying in ${retryCount * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
        continue;
      }
      
      console.warn("🚀 ~ file: ingester.js:96 ~ indexData ~ error", error)
      return error as string;
    }
  }
  
  return "Max retries exceeded";
}
