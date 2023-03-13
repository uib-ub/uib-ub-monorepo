import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from '@elastic/elasticsearch'
import { HumanMadeObjects } from '../HumanMadeObjects'
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
    apiKey: process.env.ES_APIKEY || ''
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { esIndex },
    method,
  } = req

  switch (method) {
    case 'POST':
      if (req.query.token !== process.env.ES_INDEX_SECRET) {
        return res.status(401).send('You are not authorized!')
      }
      try {
        const operations = HumanMadeObjects.flatMap(doc => [{ index: { _index: esIndex } }, doc])
        const bulkResponse = await client.bulk({ refresh: true, operations })

        /* if (bulkResponse.errors) {
          const erroredDocuments: {
            status: any; error: any; operation: any; document: any
          }[] = []
          // The items array has the same order of the dataset we just indexed.
          // The presence of the `error` key indicates that the operation
          // that we did for the document has failed.
          bulkResponse.items.forEach((action: any, i) => {
            const operation = Object.keys(action)[0]
            if (action[operation].error) {
              erroredDocuments.push({
                // If the status is 429 it means that you can retry the document,
                // otherwise it's very likely a mapping error, and you should
                // fix the document before to try it again.
                status: action[operation].status,
                error: action[operation].error,
                operation: body[i * 2],
                document: body[i * 2 + 1]
              })
            }
          })
          console.log(erroredDocuments)
        } */

        const count = await client.count({ index: esIndex })
        console.log(count)

        res.status(200).json(bulkResponse)
      } catch (err) {
        (err: any) => { return err }
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
