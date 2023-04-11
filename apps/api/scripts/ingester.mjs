import dotenv from 'dotenv';
import fetch from 'node-fetch-retry';
import inquirer from 'inquirer';
import { performance } from 'perf_hooks';
import { Client } from '@elastic/elasticsearch';
import { Transport } from '@elastic/transport';
;
dotenv.config();
const { ES_HOST, ES_APIKEY, ES_PATH, NODE_ENV } = process.env
const API = NODE_ENV === 'production' ? 'https://api-ub.vercel.app' : 'http://localhost:3009'
// store index name
let INDEX = ''

class MTransport extends Transport {
  request(params, options, callback) {
    params.path = ES_PATH + params.path
    return super.request(params, options, callback)
  }
}

const client = new Client({
  node: ES_HOST,
  /* @ts-ignore */
  Transport: MTransport,
  auth: {
    apiKey: ES_APIKEY
  }
})

// User prompts
const QUESTIONS = [
  {
    type: 'input',
    name: 'index',
    message: "What is the name of the index you want to use?",
  },
];

// 1. Ask for index name
await inquirer.prompt(QUESTIONS).then(answers => {
  INDEX = answers.index
});

/**
 * Check if index exists
 * @param {*} index 
 * @returns error if index does not exist or nothing if it does
 */
const checkIndex = async (index) => {
  const indexExists = await client.indices.exists({
    index: INDEX
  })

  if (!indexExists) {
    console.log(`The index "${index}" does not exist. Please create it first.`)
    process.exit(1)
  }
  return null
}

/**
 * Turn off the refresh interval
 * @param {*} indexName 
 */
const turnOffRefreshInterval = async (indexName) => {
  try {
    const result = await client.indices.putSettings({
      index: indexName,
      body: {
        'index.refresh_interval': '-1'
      }
    });
    console.log("The refresh interval was turned off for the duration of the indexing process.");
  } catch (error) {
    console.error("There was an error turning off the refresh interval. Continuing anyway...");
  }
};

/**
 * Turn on the refresh interval
 * @param {*} indexName 
 */
const turnOnRefreshInterval = async (indexName) => {
  try {
    const result = await client.indices.putSettings({
      index: indexName,
      body: {
        'index.refresh_interval': '1s'
      }
    });
    console.log("The refresh interval was turned on.");
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get ids from the api
 * @param {*} page 
 * @returns {Promise} array of objects with id and indentifier
 */
const getIds = async (page, limit) => {
  const response = await fetch(`${API}/items?page=${page}&limit=${limit}`, { method: 'GET', retry: 3, pause: 500 })
  const data = await response.json()
  return data
}

/**
 * Resolve the ids from the api and return the data
 * @param {*} data 
 * @returns {Array} array of objects
 */
const resolveIds = async (data) => {
  const ids = data.map(item => item.id)
  const promises = ids.map(id => fetch(id, { method: 'GET', retry: 3, pause: 300 }))
  const responses = await (await Promise.all(promises))
  const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()))
  return results
}

/**
 * Prepare data for bulk indexing
 * @param {*} data 
 * @returns {Array} array of objects
 */
const prepareData = (data) => {
  // create an array of index objects with the id
  const items = data.map(({ id }) => ({
    index: {
      _index: INDEX,
      _id: id
    }
  }));

  // create an array of objects with the id and the data
  const body = items.flatMap((item, i) => [item, data[i]]);
  return body;
};

/**
 * Bulk index the data
 * @param {*} data 
 * @returns {number} number of items indexed
 */
const indexData = async (data) => {
  if (data.length === 0) return 0
  const response = await client.bulk({
    refresh: true,
    body: data,
    pipeline: INDEX
  })

  return response.items.length
}

// 2. repeat the process for the next pages until all id have been resolved
const start = async () => {
  checkIndex(INDEX)
  //turnOffRefreshInterval(INDEX)
  let page = 0
  let total = 0
  let totalIndexed = 0
  let totalRuntime = 0

  while (true) {
    // store the start time
    const t0 = performance.now()
    // 3. get the ids from the api
    const data = await getIds(page, 100)
    // 4. count the number of ids and stop if there are no more ids
    const idCount = data.length ?? 0
    total += idCount
    if (idCount < 100) break

    // 5. break if there are no more ids
    if (!data.length) break

    // 6. resolve the id urls in the response
    const resolved = await resolveIds(data)
    // 7. prepare the responses for bulk indexing in elasticsearch
    const body = prepareData(resolved)
    // 8. bulk index the responses in elasticsearch and get the number of items indexed
    const count = await indexData(body)
    // store the end time
    const t1 = performance.now()
    // calculate the time it took to index the items
    const took = t1 - t0
    // log the number of items indexed and the time it took
    console.log(`Indexed ${count} items in ${took} milliseconds. Total: ${totalIndexed + count} of ${total} ids. Page: ${page}`)

    // store variables for reporting
    totalIndexed += count
    page += 1
    totalRuntime += took
  }

  // convert milliseconds to minutes and seconds
  const minutes = Math.floor(totalRuntime / 60000);
  const seconds = ((totalRuntime % 60000) / 1000).toFixed(0);

  // 9. report the number of items indexed
  console.log(`Indexed ${totalIndexed} items of ${total} ids in total into "${INDEX}". It took ${minutes}:${seconds} minutes.`)
  //turnOnRefreshInterval(INDEX)
  // 10. exit
}

start()
