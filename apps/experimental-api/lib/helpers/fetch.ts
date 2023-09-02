import fetchBuilder from 'fetch-retry-ts';
import { fetch as originalFetch } from 'node-fetch-native'

const options = {
  retries: 3,
  retryDelay: 1000,
  retryOn: [419, 503, 504],
};

export const apiFetch = fetchBuilder(originalFetch, options);
