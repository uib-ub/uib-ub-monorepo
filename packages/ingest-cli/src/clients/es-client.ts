import { env } from '../env';
import { Client, HttpConnection } from '@elastic/elasticsearch';

const client = new Client({
  node: env.API_SEARCH_HOST,
  Connection: HttpConnection, // TODO: remove when Bun supports ConnectionError (see https://github.com/oven-sh/bun/issues/7920)
  auth: {
    apiKey: env.API_SEARCH_WRITE_API_KEY
  },
  requestTimeout: 120000, // 2 minutes timeout
  pingTimeout: 30000     // 30 seconds ping timeout
});

export const observeClient = new Client({
  node: env.API_OBSERVE_HOST,
  Connection: HttpConnection, // TODO: remove when Bun supports ConnectionError (see https://github.com/oven-sh/bun/issues/7920)
  auth: {
    apiKey: env.API_OBSERVE_API_KEY
  },
  requestTimeout: 60000, // 1 minute timeout for logging
  pingTimeout: 30000     // 30 seconds ping timeout
});

export default client;