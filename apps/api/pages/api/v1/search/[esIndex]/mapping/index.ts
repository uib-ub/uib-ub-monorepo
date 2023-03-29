import type { NextApiRequest, NextApiResponse } from 'next'
import { marcusMapping } from './marcusMapping'
import { handleError } from '../../../../../../lib/request/esHelpers'
import client from '../../../../../../lib/clients/search.client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { esIndex },
    method,
  } = req


  switch (method) {
    case 'GET':
      try {
        const mapping = await client.indices.getMapping({ index: esIndex })
        res.status(200).json(mapping)
      } catch (err) {
        (err: Error) => { return err }
      }
      break
    case 'PUT':
      if (req.query.token !== process.env.ES_INDEX_SECRET) {
        return res.status(401).send('You are not authorized!')
      }
      try {
        /* @ts-ignore */
        const response = await putMapping(esIndex, marcusMapping, handleError)
        res.status(200).json(response)
      } catch (err) {
        (err: any) => {
          return res.status(400).json({ message: err })
        }
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
