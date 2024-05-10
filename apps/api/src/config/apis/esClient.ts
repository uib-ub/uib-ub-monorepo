import { Client, HttpConnection } from '@elastic/elasticsearch';
import { env } from '../env';

const client = new Client({
  node: env.ES_HOST,
  Connection: HttpConnection, // TODO: remove when Bun supports ConnectionError (see https://github.com/oven-sh/bun/issues/7920)
  auth: {
    apiKey: env.ES_APIKEY!
  }
});

export default client;