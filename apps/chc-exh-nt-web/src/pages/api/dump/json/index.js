import { sanityClient as client } from '../../../../lib/sanity.server'
import { getDump } from '../lib/queries'
import { toJSONLD } from '../lib'

export default async function handler(req, res) {
  const response = await client.fetch(getDump)
  const body = await response

  const json = toJSONLD(body)

  const jsonldData = {
    '@context': 'https://muna.xyz/model/0.1/context.json',
    '@graph': json,
  }

  res.status(200).json(jsonldData)
}
