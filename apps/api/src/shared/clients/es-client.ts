import { env } from '@env';
import { Client, HttpConnection } from '@elastic/elasticsearch';

const client = new Client({
  node: env.API_SEARCH_HOST,
  Connection: HttpConnection, // TODO: remove when Bun supports ConnectionError (see https://github.com/oven-sh/bun/issues/7920)
  auth: {
    apiKey: env.API_SEARCH_API_KEY
  }
});

export const observeClient = new Client({
  node: env.API_OBSERVE_HOST,
  Connection: HttpConnection, // TODO: remove when Bun supports ConnectionError (see https://github.com/oven-sh/bun/issues/7920)
  auth: {
    apiKey: env.API_OBSERVE_API_KEY
  }
});

export default client;