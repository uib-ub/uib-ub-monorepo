import * as jsonld from 'jsonld'
import Cors from 'cors'
import { API_URL, getBaseUrl, SPARQL_PREFIXES } from '../../../../lib/constants'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

async function getObject(url) {
  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri a crm:E22_Human-Made_Object ;
        rdfs:label ?label ;
        dct:identifier ?identifier ;
        muna:image ?image ;
        muna:subjectOfManifest ?manifest ;
        foaf:homepage ?homepage .
    } WHERE { 
      GRAPH ?g {
        ?uri rdf:type/(rdfs:subClassOf)* bibo:Document ;
          dct:identifier ?identifier .
          OPTIONAL {?uri dct:title ?title } .
          OPTIONAL {?uri foaf:name ?name } .
          OPTIONAL {?uri skos:prefLabel ?prefLabel } .
          OPTIONAL {?uri rdfs:label ?rdfsLabel } .
          BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
          # Get multipage image
        OPTIONAL { 
          ?uri ubbont:hasRepresentation / dct:hasPart ?page .
          ?page ubbont:sequenceNr 1 .
          ?page ubbont:hasResource ?resource .
          OPTIONAL {?resource ubbont:hasSMView ?smImage.}  
          OPTIONAL {?resource ubbont:hasMDView ?mdImage.}
        }
        # Get singlepage image
        OPTIONAL { 
          ?uri ubbont:hasRepresentation / dct:hasPart ?part .
          OPTIONAL {?part ubbont:hasMDView ?imgMD .}
          OPTIONAL {?part ubbont:hasSMView ?imgSM .} 
        }
        BIND (COALESCE(?imgMD,?imgSM,?mdImage,?smImage) AS ?image) .
        
        OPTIONAL { 
          ?uri dct:license / rdfs:label ?licenseLabel .
        }
        BIND(iri(REPLACE(str(?uri), "data.ub.uib.no","marcus.uib.no","i")) as ?homepage) .
        BIND(CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest") as ?manifest) .
      } 
    }
    LIMIT 100
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
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':
      const url = 'https://sparql.ub.uib.no/sparql/query?query='

      const response = await getObject(url)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.json()
        //console.log(result)
        //res.status(200).json(result)

        const awaitFramed = jsonld.frame(result, {
          '@context': [`${getBaseUrl()}/ns/ubbont/context.json`],
          '@type': 'HumanMadeObject',
          '@embed': '@always',
        })
        let framed = await awaitFramed

        // // Change id as this did not work in the query
        // framed.id = `${getBaseUrl()}/items/${framed.identifier}`
        // // We assume all @none language tags are really norwegian
        framed = JSON.parse(JSON.stringify(framed).replaceAll('"none":', '"no":'))

        // framed.timespan = getTimespan(framed?.created, framed?.madeAfter, framed?.madeBefore)
        // delete framed?.madeAfter
        // delete framed?.madeBefore

        res.status(200).json(framed)
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
