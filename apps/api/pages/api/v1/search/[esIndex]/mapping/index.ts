import type { NextApiRequest, NextApiResponse } from 'next'
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
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
