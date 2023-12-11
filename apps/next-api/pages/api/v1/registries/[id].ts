import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import * as jsonld from 'jsonld'
import { API_URL, getBaseUrl, SPARQL_PREFIXES } from '../../../../lib/constants'
import { runMiddleware } from '../../../../lib/request/runMiddleware'
import { skosFrame } from '../../../../lib/response/iiif/frames/skosFrame'
import { Context } from 'jsonld/jsonld-spec'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

async function getObject(id: string | string[] | undefined, url: string): Promise<any> {
  if (!id) {
    throw Error
  }
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?concept a ?type ;
        skos:inScheme ?sLabel ;
        ubbont:homepage ?homepage ;
        skos:broader ?bLabel ;
        ?cP ?cO .
      ?scheme a skos:ConceptScheme ;
        skos:prefLabel ?sLabel .
    }
    WHERE {
      VALUES ?schemeID { "${id}"}
      ?scheme dct:identifier ?schemeID ;
              skos:prefLabel ?sLabel .
      ?concept skos:inScheme ?scheme ;
               skos:broader/skos:prefLabel ?bLabel ;
               ?cP ?cO .
      FILTER(?cP != ubbont:isSubjectOf && ?cP != skos:inScheme && ?cP != skos:topConceptOf && ?cP != skos:narrower && ?cP != skos:broader && ?cP != ubbont:cataloguer && ?cP != skos:related && ?cP != dc:relation && ?cP != ubbont:showWeb) 
      BIND(replace(str(?concept), "data.ub", "marcus") AS ?homepage)
    }
  `

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}&output=json`,
  )
  return results
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':

      // Find the service that contains data on this item
      const checkedServices = await fetch(`${API_URL}/resolver/${id}?v=1`).then(res => res.json())
      const url = await checkedServices.url
      // No URL means no service found, but this is horrible error handeling
      if (!url) return res.status(404).json({ message: 'ID not found' })

      const response = await getObject(id, url)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const results = await response.json()

        // Frame the result for nested json
        const awaitFramed = jsonld.frame(results, {
          '@context': skosFrame as any,
          '@type': 'Concept'
        });
        let framed = await awaitFramed

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
