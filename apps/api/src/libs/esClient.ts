import dotenv from 'dotenv';
const { Client } = require('@elastic/elasticsearch')

dotenv.config()

const client = new Client({
  node: process.env.ES_HOST,
  auth: {
    apiKey: process.env.ES_APIKEY
  }
});

export default client;