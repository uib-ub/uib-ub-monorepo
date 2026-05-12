import { Client, HttpConnection } from '@elastic/elasticsearch';

const node = process.env.ES_HOST;
const apiKey = process.env.ES_APIKEY;

export const ES_INDEX = process.env.ES_INDEX as string;

if (!node || !apiKey || !ES_INDEX) {
  throw new Error('Missing ES_HOST / ES_APIKEY / ES_INDEX');
}

let instance: Client | undefined;

export const getEsClient = (): Client => {
  if (!instance) {
    instance = new Client({
      node,
      auth: { apiKey },
      Connection: HttpConnection,
    });
  }
  return instance;
};
