import { getClient } from '../../../../lib/sanity.server'

export default async function handler(req, res) {
  const { method } = req

  const preview = false

  async function getIds() {
    const response = await getClient(preview).fetch(
      `[
        ...*[_type == "HumanMadeObject" && _id match "ubb-*"]._id | order(_id)
      ]`,
    )

    return response.map((id) => `"${id}"`).join(' ')
  }

  async function getObject(ids) {
    const query = `
      PREFIX dct: <http://purl.org/dc/terms/>

      SELECT ?url ?title
      WHERE {
        GRAPH ?g {
          ?url dct:identifier ?ids ;
            dct:title ?title .
          VALUES ?ids { ${ids} }
        }
      }
    `

    const results = await fetch(
      `http://sparql.ub.uib.no/sparql/query?query=${encodeURIComponent(query)}&output=text/csv`,
    )

    return results
  }

  switch (method) {
    case 'GET':
      // eslint-disable-next-line no-case-declarations
      const ids = await getIds()
      // eslint-disable-next-line no-case-declarations
      const response = await getObject(ids)

      if (response.status >= 200 && response.status <= 299) {
        const results = await response.body

        res.status(200).send(results)
      } else {
        // Handle errors
        console.log(response.status, response.statusText)
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
