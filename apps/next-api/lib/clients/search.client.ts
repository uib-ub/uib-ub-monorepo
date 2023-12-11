import { Client } from '@elastic/elasticsearch'
const { Transport } = require('@elastic/transport')

class MTransport extends Transport {
  request(params: any, options: any, callback: any) {
    params.path = process.env.ES_PATH + params.path
    return super.request(params, options, callback)
  }
}

const client = new Client({
  node: process.env.ES_HOST,
  /* @ts-ignore */
  Transport: MTransport,
  auth: {
    apiKey: process.env.ES_APIKEY!
  }
})

export default client