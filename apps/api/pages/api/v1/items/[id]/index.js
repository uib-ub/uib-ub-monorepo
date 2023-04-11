import * as jsonld from 'jsonld'
import { getTimespan } from '../../../../../lib/response/muna/EDTF'
import Cors from 'cors'
import { API_URL, getBaseUrl, SPARQL_PREFIXES } from '../../../../../lib/constants'
import { runMiddleware } from '../../../../../lib/request/runMiddleware'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

async function getObject(id, url) {
  if (!id) {
    throw Error
  }

  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri ?p ?o ;
        a crm:E22_Human-Made_Object ;
        rdfs:label ?label ;
        muna:image ?image ;
        muna:subjectOfManifest ?manifest ;
        foaf:homepage ?homepage .
      ?o a ?oClass ;
        dct:identifier ?identifier ;
        rdfs:label ?oLabel ;
        wgs:long ?long ;
        wgs:lat ?lat .
    } WHERE { 
      VALUES ?id {"${id}"}
      ?uri dct:identifier ?id ;
        ?p ?o .
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
        ?o a ?oClass ;
          (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel .
        OPTIONAL {?o dct:identifier ?identifier } .
        OPTIONAL {
          ?o wgs:long ?long ;
            wgs:lat ?lat
        }
        FILTER(?oClass != rdfs:Class)
      }
      OPTIONAL { 
        ?uri dct:license / rdfs:label ?licenseLabel .
      }
      BIND(iri(REPLACE(str(?uri), "data.ub.uib.no","marcus.uib.no","i")) as ?homepage) .
      BIND(CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest") as ?manifest) .
      FILTER(?p != ubbont:cataloguer && ?p != ubbont:internalNote)
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
    query: { id, context },
    method,
  } = req

  let useIIIFContext = ""

  switch (context) {
    case "ubbont":
      useIIIFContext = context
      break;
    case "es":
      useIIIFContext = context
      break;
    default:
      useIIIFContext = "ubbont"
      break;
  }

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
        const response = await getObject(id, service.url)

        // Deal with response
        if (response.status >= 200 && response.status <= 299) {
          const result = await response.json()

          const awaitFramed = jsonld.frame(result, {
            '@context': [`${getBaseUrl()}/ns/${useIIIFContext}/context.json`],
            '@type': 'HumanMadeObject',
            '@embed': '@always',
          })
          let framed = await awaitFramed

          // Change id as this did not work in the query
          framed.id = `${getBaseUrl()}/items/${framed.identifier}`
          // We assume all @none language tags are really norwegian
          framed = JSON.parse(JSON.stringify(framed).replaceAll('"none":', '"no":'))

          framed.timespan = getTimespan(framed?.created, framed?.madeAfter, framed?.madeBefore)
          delete framed?.madeAfter
          delete framed?.madeBefore

          // @TODO: Remove this when we have dct:modified on all items in the dataset
          framed.modified = {
            "type": "xsd:date",
            "@value": framed.modified ?? "2020-01-01T00:00:00"
          }

          res.status(200).json(framed)
        }
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
      }

      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
