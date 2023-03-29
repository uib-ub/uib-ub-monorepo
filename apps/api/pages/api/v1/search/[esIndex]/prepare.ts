import type { NextApiRequest, NextApiResponse } from 'next'
import { marcusMapping } from './mapping/marcusMapping'
import { marcusNextIngester } from './pipelines/marcusNextIngester'
import client from '../../../../../lib/clients/search.client'

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
        /* @ts-ignore */
        const deleteIndex = await client.indices.delete({ index: esIndex }, function (err) {
          if (err) {
            throw new Error(err)
          }
        })
        /* @ts-ignore */
        const createIndex = await client.indices.create({ index: esIndex }, function (err) {
          if (err) {
            throw new Error(err)
          }
        })

        /* @ts-ignore */
        const putPipeline = await client.ingest.putPipeline(marcusNextIngester, function (err) {
          if (err) {
            throw new Error(err)
          }
        })

        /* @ts-ignore */
        const putMapping = await client.indices.putMapping({ index: esIndex, body: marcusMapping }, function (err) {
          if (err) {
            throw new Error(err)
          }
        })

        Promise.all([deleteIndex, createIndex, putPipeline, putMapping]).then((values) => {
          return res.status(200).json(values)
        })

        //res.status(200).json({ deleteIndex, createIndex, putMapping, putPipeline })
      } catch (err) {
        (err: any) => { return err }
        return res.status(200).json({ message: err })
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
