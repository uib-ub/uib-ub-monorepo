// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XataClient } from '../../../utils/xata';

const xata = new XataClient()

const getLinks = async () => {
  return await xata.db.links.getAll();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const links = await getLinks()
    res.status(200).json(links)
  } else {
    res.status(405).json({
      error: { message: 'Method not allowed' },
    })
  }
}
