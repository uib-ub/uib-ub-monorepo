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
  const LIMIT = 1000
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?apiuri a <http://xmlns.com/foaf/0.1/Agent> ;
        a ?class ;
        foaf:name ?name ;
        foaf:firstName ?firstName ;
        foaf:familyName ?familyName ;
        foaf:homepage ?homepage ;
        dbo:birthYear ?bYear ;
        dbo:deathYear ?dYear ;
        dbo:birthDate ?bDate ;
        dbo:deathDate ?dDate ;
        dbo:profession ?profession .
    } WHERE { 
      GRAPH ?g {
        VALUES ?type {<http://xmlns.com/foaf/0.1/Person> <http://xmlns.com/foaf/0.1/Agent> <http://xmlns.com/foaf/0.1/Organization> <http://dbpedia.org/ontology/Company> <http://data.ub.uib.no/ontology/Family>}
        ?uri a ?type ;
          a ?class ;
          foaf:name ?name ;
          foaf:firstName ?firstName ;
          foaf:familyName ?familyName ;
          dct:identifier ?id .
          OPTIONAL { ?uri dbo:birthYear ?bYear } .
          OPTIONAL { ?uri dbo:deathYear ?dYear } .
          OPTIONAL { ?uri dbo:birthDate ?bDate } .
          OPTIONAL { ?uri dbo:deathDate ?dDate } .
          OPTIONAL { ?uri dbo:profession ?profession } .
        BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage) .
        BIND(iri(CONCAT("https://api-ub.vercel.app/actors/", ?id)) as ?apiuri) .
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
          '@type': 'Agent',
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
