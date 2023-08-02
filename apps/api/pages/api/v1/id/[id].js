import Cors from 'cors'
import * as jsonld from 'jsonld'
import { API_URL } from '../../../../lib/constants'
import { runMiddleware } from '../../../../lib/request/runMiddleware'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

async function getObject(id, url) {
  if (!id) {
    throw Error
  }

  const query = `PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX muna: <http://muna.xyz/model/0.1/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>
  CONSTRUCT {
    ?uri ?p ?o ;
      muna:subjectOfManifest ?manifest ;
      rdfs:label ?label .
  } WHERE { 
    VALUES ?id {"${id}"}
    ?uri dct:identifier ?id ;
      ?p ?o .
    OPTIONAL {?uri dct:title ?title } .
    OPTIONAL {?uri foaf:name ?name } .
    OPTIONAL {?uri skos:prefLabel ?prefLabel } .
    OPTIONAL {?uri rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
    OPTIONAL {?uri ubbont:hasRepresentation  ?repr } .
    BIND(IF(BOUND(?repr),CONCAT("https://api-ub.vercel.app/items/", ?id, "?as=iiif"), ?repr) as ?manifest) .
  }`

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}&output=json`,
  )
  return results
}

export default async function handler(req, res) {
  const {
    query: { format, id },
    method,
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':

      // Find the service that contains data on this item
      const checkedServices = await fetch(`${API_URL}/resolver/${id}?v=1`)
      if (checkedServices.status === 404) {
        return res.status(404).json({ message: 'Not found' })
      }
      if (!checkedServices.ok) {
        return res.status(400).json({ message: 'Bad request' })
      }

      try {
        const service = await checkedServices.json()
        const response = await getObject(id, service.url, format)

        // Deal with response
        if (response.status >= 200 && response.status <= 299) {
          const result = await response.json()

          let compacted = await jsonld.compact(
            result, 'http://localhost:3009/ns/ubbont/context.json');

          // We assume all @none language tags are really norwegian
          compacted = JSON.parse(JSON.stringify(compacted).replaceAll('"none":', '"no":'))

          res.status(200).send(compacted)
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' })
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
