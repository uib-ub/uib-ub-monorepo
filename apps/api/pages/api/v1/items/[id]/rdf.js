import Cors from 'cors'
import { API_URL, SPARQL_PREFIXES } from '../../../../../lib/constants'

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

async function getObject(id, url, format) {
  if (!id) {
    throw Error
  }

  let outputType = '&output=json'

  if (format) {
    switch (format) {
      case 'xml':
        outputType = '&output=xml'
        break;
      case 'turtle':
        outputType = '&output=turtle'
        break;
      case 'json':
        outputType = '&output=json'
        break;
      case '':
        outputType = '&output=json'
        break;

      default:
        res.status(400).end(`Format ${format} Not Allowed. Use "xml" or "turtle".`)
        break;
    }
  }

  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri ?p ?o ;
        a crm:E22_Human-Made_Object ;
        rdfs:label ?label ;
        muna:image ?image ;
        muna:subjectOfManifest ?manifest ;
        foaf:homepage ?homepage ;
        muna:spatialHierarchy ?spatialBroader .
      ?o a ?oClass ;
        dct:identifier ?identifier ;
        rdfs:label ?oLabel ;
        wgs:long ?long ;
        wgs:lat ?lat .
    } WHERE { 
      GRAPH ?g {
        VALUES ?id {'${id}'}
        ?uri dct:identifier ?id ;
          ?p ?o .
        OPTIONAL {?uri dct:title ?title } .
        OPTIONAL {?uri foaf:name ?name } .
        OPTIONAL {?uri skos:prefLabel ?prefLabel } .
        OPTIONAL {?uri rdfs:label ?rdfsLabel } .
        BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
        OPTIONAL { 
          ?uri dct:spatial ?levelUri . 
          ?levelUri skos:broader* ?broaderUri . 
          ?broaderUri skos:prefLabel ?spatialBroader. 
        } 
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
          ?o a ?oClass ;
            (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel ;
            dct:identifier ?identifier .
            OPTIONAL {
              ?o wgs:long ?long ;
                wgs:lat ?lat
            }
        }
        OPTIONAL { 
          ?uri dct:license / rdfs:label ?licenseLabel .
        }
        BIND(iri(REPLACE(str(?uri), "data.ub.uib.no","marcus.uib.no","i")) as ?homepage) .
        BIND(CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest") as ?manifest) .
        FILTER(?p != ubbont:cataloguer && ?p != ubbont:internalNote)
      } 
    }
  `

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}${outputType}`
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
        return res.status(404).json({ message: 'ID not found' })
      }

      const service = await checkedServices.json()
      // No URL means no service found, but this is horrible error handeling

      const response = await getObject(id, service.url, format)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.text()
        //console.log(result)
        //res.status(200).json(result)

        res.status(200).send(result)
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
