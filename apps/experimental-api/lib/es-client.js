const { Client } = require("@elastic/elasticsearch");
const { Transport } = require("@elastic/transport");

class MTransport extends Transport {
  request(params, options, callback) {
    params.path = process.env.ES_PATH + params.path;
    return super.request(params, options, callback);
  }
}

const esClient = new Client({
  node: process.env.ES_HOST,
  Transport: MTransport,
  auth: {
    apiKey: process.env.ES_APIKEY
  }
});

module.exports = { esClient };