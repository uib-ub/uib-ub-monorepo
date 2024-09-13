import { XataClient } from './xata';

export const xataClient = () => {
  const xata = new XataClient({
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH,
  });
  return xata;
};