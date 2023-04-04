import type { NextApiRequest, NextApiResponse } from 'next'
import { mappings } from '../../../../../lib/request/search/mappings'
import { pipelines } from '../../../../../lib/request/search/pipelines'
import client from '../../../../../lib/clients/search.client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { esIndex },
    method,
  } = req

  // ts ignore because of the dynamic index name
  // @ts-ignore
  const PIPELINES = pipelines[esIndex.replace('-', '_')]
  // @ts-ignore
  const MAPPINGS = mappings[esIndex.replace('-', '_')]

  if (!PIPELINES || !MAPPINGS) {
    return res.status(404).json(
      {
        ok: false,
        message: 'Missing mappings or pipelines for this index name, aborting.'
      }
    )
  }

  switch (method) {
    case 'POST':
      if (req.query.token !== process.env.ES_INDEX_SECRET) {
        return res.status(401).send('You are not authorized!')
      }
      try {
        /* @ts-ignore */
        const deleteIndex = await client.indices.delete({ index: esIndex, ignore_unavailable: true }, function (err) {
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
        const putPipeline = await client.ingest.putPipeline(PIPELINES, function (err) {
          if (err) {
            throw new Error(err)
          }
        })

        /* @ts-ignore */
        const putMapping = await client.indices.putMapping({ index: esIndex, body: MAPPINGS }, function (err) {
          if (err) {
            throw new Error(err)
          }
        })

        Promise.all([deleteIndex, createIndex, putPipeline, putMapping]).then((values) => {
          return res.status(200).json(values)
        })

        res.status(200).json({
          ok: true,
          message: 'Index created, pipelines and mappings applied.',
          jobs: [
            {
              "name": "Delete index",
              ...deleteIndex
            },
            {
              "name": "Create index",
              ...createIndex
            },
            {
              "name": "Add pipeline",
              ...putPipeline
            },
            {
              "name": "Add mapping",
              ...putMapping
            }
          ]
        })
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
