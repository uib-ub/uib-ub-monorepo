import { sanityClient as client } from '../../../../../lib/sanity.server'
import { toJSONLD } from '../../lib'
import { getID } from '../../lib/queries'

export default async function idHandler(req, res) {
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

  // User with id exists
  if (jsonldData) {
    res.status(200).json(jsonldData)
  } else {
    res.status(404).json({ message: `Document with id: ${id} not found.` })
  }
}
