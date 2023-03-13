import { sanityClient as client } from '../../../../../lib/sanity.server'
import * as jsonld from 'jsonld'
import { toJSONLD } from '../../lib'
import { getID } from '../../lib/queries'

export default async function rdfIdHandler(req, res) {
  const {
    query: { id },
  } = req

  const response = await client.fetch(getID, { id })
  const body = await response

  const json = toJSONLD(body)

  const jsonldData = {
    '@context': 'https://muna.xyz/model/0.1/context.json',
    ...json[0],
  }

  const nquads = await jsonld.toRDF(jsonldData, { format: 'application/n-quads' })

  // User with id exists
  if (nquads) {
    res.status(200).send(nquads)
  } else {
    res.status(404).json({ message: `Document with id: ${id} not found.` })
  }
}
