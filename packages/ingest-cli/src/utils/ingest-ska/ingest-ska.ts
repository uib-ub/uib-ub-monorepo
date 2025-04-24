import { bulkIndexData } from '../indexers/utils/bulkIndexData';
import { chunk } from '../indexers/utils/chunk';
import { flatMapDataForBulkIndexing } from '../indexers/utils/flatMapDataForBulkIndexing';
import { getSkaAgents } from './get-ska-agents';
import { getSkaDocuments } from './get-ska-documents';
import { getSkaTopics } from './get-ska-topics';

interface IndexDataResponse {
  count: number;
  errors: string[];
}

interface IngestSkaResponse {
  agents: IndexDataResponse;
  documents: IndexDataResponse;
  topics: IndexDataResponse;
}


export const ingestSka = async (): Promise<IngestSkaResponse> => {
  const index = "search-legacy-ska"
  try {
    let agentsReport: IndexDataResponse = { count: 0, errors: [] }
    let documentsReport: IndexDataResponse = { count: 0, errors: [] }
    let topicsReport: IndexDataResponse = { count: 0, errors: [] }

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

    return {
      agents: agentsReport,
      documents: documentsReport,
      topics: topicsReport,
    }

  } catch (error) {
    console.error(error);
    return {
      agents: { count: 0, errors: [String(error)] },
      documents: { count: 0, errors: [String(error)] },
      topics: { count: 0, errors: [String(error)] }
    };
  }
}
