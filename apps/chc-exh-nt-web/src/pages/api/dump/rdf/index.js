import { sanityClient as client } from '../../../../lib/sanity.server'
import * as jsonld from 'jsonld'
import { toJSONLD } from '../lib'
import { getDump } from '../lib/queries'

export default async function rdfHandler(req, res) {
  const response = await client.fetch(getDump)
  const body = await response

  const json = toJSONLD(body)

  const jsonldData = {
    '@context': 'https://muna.xyz/model/0.1/context.json',
    '@graph': [...json],
  }

  const nquads = await jsonld.toRDF(jsonldData, { format: 'application/n-quads' })

  res.status(200).send(nquads)
}
