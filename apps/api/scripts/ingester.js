require('dotenv').config()
const fetch = require('node-fetch-retry');
const { performance } = require('perf_hooks');
const { Client } = require('@elastic/elasticsearch')
const { Transport } = require('@elastic/transport')

const { ES_HOST, ES_APIKEY, ES_PATH } = process.env
// Hardcoded for now
const PIPELINE = 'marcus-demo'

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

const getIds = async (page) => {
  const response = await fetch(`http://localhost:3009/items?page=${page}`, { method: 'GET', retry: 3, pause: 500 })
  const data = await response.json()
  console.log("🚀 ~ file: ingester.js:28 ~ getIds ~ data:", data)
  return data
}

// 2. resolve the id urls in the response
const resolveIds = async (data) => {
  const ids = data.map(item => item.id)
  const promises = ids.map(id => fetch(id, { method: 'GET', retry: 3, pause: 300 }))
  const responses = await (await Promise.all(promises))
  const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()))

  // console.log("🚀 ~ file: ingester.js:50 ~ resolveIds ~ ids:", ids)
  // console.log("🚀 ~ file: ingester.js:52 ~ resolveIds ~ promises:", promises)
  // console.log("🚀 ~ file: ingester.js:54 ~ resolveIds ~ responses:", responses)

  return results
}

// 3. prepare the responses for bulk indexing in elasticsearch
const prepareData = (data) => {
  const items = data.map(item => {
    return {
      index: {
        _index: 'marcus-demo',
        _id: item.id
      }
    }
  })

  const body = items.reduce((acc, item, i) => {
    acc.push(item)
    acc.push(data[i])
    return acc
  }, [])

  return body
}

// 4. bulk index the responses in elasticsearch
const indexData = async (data) => {
  if (data.length === 0) return 0
  const response = await client.bulk({
    refresh: true,
    body: data,
    pipeline: PIPELINE
  })
  // console.log("🚀 ~ file: ingester.js:86 ~ indexData ~ response:", response)

  return response.items.length
}

// 5. repeat the process for the next pages until all id have been resolved
const start = async () => {
  let page = 0
  let total = 0
  let totalIndexed = 0

  while (true) {
    const t0 = performance.now()
    const data = await getIds(page)
    const idCount = data.length ?? 0
    total += idCount
    if (!data.length) break

    const resolved = await resolveIds(data)
    const body = prepareData(resolved)
    const count = await indexData(body)
    const t1 = performance.now()
    console.log(`Indexed ${count} items in ${t1 - t0} milliseconds.`)
    totalIndexed += count
    page += 1
    if (idCount < 100) break
  }

  // 6. report the number of items indexed
  console.log(`Indexed ${totalIndexed} items of ${total} ids in total.`)
  // 7. exit
}

start()
