import type { NextApiRequest, NextApiResponse } from 'next'
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
    apiKey: process.env.ES_APIKEY || ''
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case 'POST':
      if (req.query.token !== process.env.ES_INDEX_SECRET) {
        return res.status(401).send('You are not authorized!')
      }
      try {
        /* @ts-ignore */
        const deleteIndex = await client.indices.delete({ index: id }, function (err) {
          if (err) {
            console.log(err);
          }
        })
        console.log(deleteIndex);
        /* @ts-ignore */
        // if (!deleteIndex.ok) {
        //   /* @ts-ignore */
        //   console.log(`HTTP error: ${deleteIndex.status}`);
        // }

        /* @ts-ignore */
        const createIndex = await client.indices.create({ index: id }, function (err) {
          if (err) {
            console.log(err);
          }
        })
        console.log(createIndex);
        /* @ts-ignore */
        // if (!createIndex.ok) {
        //   /* @ts-ignore */
        //   console.log(`HTTP error: ${createIndex.status}`);
        // }

        /* @ts-ignore */
        // const putMapping = await client.indices.putMapping({ index: id, body: marcusMapping }, function (err) {
        //   if (err) {
        //     console.log(err);
        //   }
        // })
        // console.log(putMapping);

        res.status(200).json({ deleteIndex, createIndex })
      } catch (err) {
        (err: any) => { return err }
        return res.status(200).json({ message: err })
      } finally {
        return res.status(400).json({ message: 'Woops, done' })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
