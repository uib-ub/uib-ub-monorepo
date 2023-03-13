import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import * as jsonld from 'jsonld'
import { getBaseUrl, SPARQL_PREFIXES } from '../../../../lib/constants'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

async function getObject(): Promise<any> {
  const LIMIT = 300000
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?apiuri a ?type ;
        a ?class ;
        skos:prefLabel ?label ;
        ubbont:begin ?begin ;
        ubbont:end ?end ;
        foaf:homepage ?homepage ;
        dct:identifier ?id .
    } WHERE { 
      GRAPH ?g {
        VALUES ?type {<http://purl.org/NET/c4dm/event.owl#Event>}
        ?uri a ?type ;
          a ?class ;
          skos:prefLabel ?label ;
          dct:identifier ?id .
        OPTIONAL { ?uri ubbont:begin ?begin } .
        OPTIONAL { ?uri ubbont:end ?end } .
        BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage) .
        BIND(iri(CONCAT("https://api-ub.vercel.app/events/", ?id)) as ?apiuri) .
      } 
    } LIMIT ${LIMIT}
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
          '@type': 'Event',
          '@embed': '@never',
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
