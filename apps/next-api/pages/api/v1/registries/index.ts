import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import * as jsonld from 'jsonld'
import { getBaseUrl, SPARQL_PREFIXES } from '../../../../lib/constants'
import { runMiddleware } from '../../../../lib/request/runMiddleware'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

async function getObject(): Promise<any> {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?id a skos:ConceptScheme . 
      ?id ?p ?o .
      ?id bibo:pages ?count .
      ?o a ?oClass ; 
        rdfs:label ?o2 .
    }
    WHERE { 
      {
        ?id a skos:ConceptScheme . 
        ?id ?p ?o .
        OPTIONAL {
          ?c skos:inScheme ?id .
        }
        OPTIONAL { 
          ?o a ?oClass ; 
            dct:title|skos:prefLabel|rdfs:label|foaf:name ?o2 .
        } .
        {
          SELECT ?id (COUNT(?c) AS ?count) WHERE {
            ?c skos:inScheme ?id .
          }
          GROUP BY ?id
      } 
    } UNION {
    SERVICE <https://sparql.ub.uib.no/skeivtarkiv/query> { 
      ?id a skos:ConceptScheme . 
      ?id ?p ?o .
      OPTIONAL {
        ?c skos:inScheme ?id .
      }
      OPTIONAL { 
        ?o a ?oClass ; 
          dct:title|skos:prefLabel|rdfs:label|foaf:name ?o2 .
      } .
      {
        SELECT ?id (COUNT(?c) AS ?count) WHERE {
          ?c skos:inScheme ?id .
        }
        GROUP BY ?id
      }
    }}
    }
  `

  const results = await fetch(
    `${process.env.MARCUS_API}${encodeURIComponent(
      query,
    )}&output=json`,
  )
  return results
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':
      const response = await getObject()

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.json()
        //console.log(result)

        // Frame the result for nested json
        const awaitFramed = jsonld.frame(result, {
          '@context': [`${getBaseUrl()}/ns/ubbont/context.json`],
          '@type': 'ConceptScheme',
          '@embed': '@always',
        })
        const framed = await awaitFramed

        res.status(200).json(framed['@graph'])
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
