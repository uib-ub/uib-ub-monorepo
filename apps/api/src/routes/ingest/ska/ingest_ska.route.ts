import { bulkIndexData } from '@helpers/indexers/bulkIndexData';
import { chunk } from '@helpers/indexers/chunk';
import { flatMapDataForBulkIndexing } from '@helpers/indexers/flatMapDataForBulkIndexing';
import { OpenAPIHono } from '@hono/zod-openapi';
import { getSkaAgents } from '@services/sparql/ska/getSkaAgents';
import { getSkaDocuments } from '@services/sparql/ska/getSkaDocuments';
import { getSkaTopics } from '@services/sparql/ska/getSkaTopics';

interface IndexDataResponse {
  count: number;
  errors: string[];
}

const route = new OpenAPIHono();

route.get('/ska', async (c) => {
  const index = "search-legacy-ska"
  try {
    let agentsReport = {}
    let documentsReport = {}
    let topicsReport = {}

    const agents: any = await getSkaAgents()
    if (agents.length > 0) {
      const chunkedAgents: any = chunk(agents, 1000);
      agentsReport = await chunkedAgents.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
        const acc = await accPromise; // Resolve the accumulator promise
        const preparedAgents = flatMapDataForBulkIndexing(data, index);
        const result = await bulkIndexData(preparedAgents, index) as IndexDataResponse;
        return {
          count: acc.count + result.count,
          errors: [
            ...acc.errors,
            ...result.errors
          ]
        };
      }, Promise.resolve({ count: 0, errors: [] }));
    }

    const documents: any = await getSkaDocuments()
    if (documents.length > 0) {
      const chunkedDocuments: any = chunk(documents, 1000);
      documentsReport = await chunkedDocuments.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
        const acc = await accPromise; // Resolve the accumulator promise
        const preparedDocuments = flatMapDataForBulkIndexing(data, index);
        const result = await bulkIndexData(preparedDocuments, index) as IndexDataResponse;
        return {
          count: acc.count + result.count,
          errors: [
            ...acc.errors,
            ...result.errors
          ]
        };
      }, Promise.resolve({ count: 0, errors: [] }));
    }

    const topics: any = await getSkaTopics()
    if (topics.length > 0) {
      const chunkedTopics: any = chunk(topics, 1000);
      topicsReport = await chunkedTopics.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
        const acc = await accPromise; // Resolve the accumulator promise
        const preparedTopics = flatMapDataForBulkIndexing(data, index)
        const result = await bulkIndexData(preparedTopics, index) as IndexDataResponse;
        return {
          count: acc.count + result.count,
          errors: [
            ...acc.errors,
            ...result.errors
          ]
        };
      }, Promise.resolve({ count: 0, errors: [] }));
    }
    return c.json({
      agents: agentsReport,
      documents: documentsReport,
      topics: topicsReport,
    })

  } catch (error) {
    console.error(error);
  }
})

export default route;