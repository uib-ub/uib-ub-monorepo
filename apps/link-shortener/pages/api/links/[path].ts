// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XataClient } from '../../../utils/xata';

const xata = new XataClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query

  if (req.method === 'GET') {
    try {
      const response: any = await xata.db.links.filter("path", path as string).getFirst()

      if (!response) {
        return res.status(404).json({
          error: { message: `No redirect found` },
        })
      }

      res.status(200).json(response)
    } catch (err) {
      res.status(500).json({
        error: { message: `An error ocurred, ${err}` },
      })
    }
  } else {
    res.status(405).json({
      error: { message: 'Method not allowed' },
    })
  }
}
