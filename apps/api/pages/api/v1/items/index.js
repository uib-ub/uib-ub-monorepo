import Cors from 'cors'
import { SPARQL_PREFIXES } from '../../../../lib/constants'
import { runMiddleware } from '../../../../lib/request/runMiddleware'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['GET', 'HEAD'],
})

async function getObject(url, page = 0, limit = 100) {
  const LIMIT = limit
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri dct:identifier ?id .
    } WHERE { 
      SELECT DISTINCT ?uri ?id WHERE 
        { 
          ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
            dct:identifier ?id .
        }
      ORDER BY ?id
      OFFSET ${(page * LIMIT)}
      LIMIT ${LIMIT}
    }
  `

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}&output=json`,
  )
  return results
}

export default async function handler(req, res) {
  const {
    method,
    query: { page },
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':
      const url = 'https://sparql.ub.uib.no/sparql/query?query='

      const response = await getObject(url, page)
      // console.log("🚀 ~ file: index.js:65 ~ handler ~ page:", page)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.json()
        // console.log("🚀 ~ file: index.js:54 ~ handler ~ result:", result)
        delete result['@context']
        const data = result['@graph'].map((item) => {
          item['@id'] = item.id
          item.id = `https://api-ub.vercel.app/items/${item.identifier['@value'] ?? item.identifier}`
          delete item['@id']
          return item
        })

        res.status(200).json(data)
      } else {
        // Handle errors
        console.log(response.status, response.statusText);
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
