import { sortBy } from 'lodash'
import Cors from 'cors'
import { API_URL, getBaseUrl, SPARQL_PREFIXES } from '../../../../lib/constants'
import { runMiddleware } from '../../../../lib/request/runMiddleware'
import { labelSplitter } from '../../../../lib/response/labelSplitter'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

async function getData(url, id) {
  const query = `
    ${SPARQL_PREFIXES}

    CONSTRUCT 
      { 
        ?uri iiif_prezi:summary ?count ;
          rdfs:label ?colLabel .
        ?item a muna:HumanMadeObject ;
          rdfs:label ?itemLabel ;
          dct:identifier ?itemId ;
          sc:thumbnail ?itemThumb .
      }
    WHERE
      { 
        { SELECT ?uri ?colLabel (COUNT(?part) AS ?count)
            WHERE
              { VALUES ?id { "${id}" }
                ?uri  dct:identifier  ?id ;
                      dct:hasPart     ?part .
                ?part rdf:type/(rdfs:subClassOf)* bibo:Document .

                OPTIONAL {?uri dct:title ?title } .
                OPTIONAL {?uri foaf:name ?name } .
                OPTIONAL {?uri skos:prefLabel ?prefLabel } .
                OPTIONAL {?uri rdfs:label ?rdfsLabel } .
                BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?colLabel) .
              }
            GROUP BY ?uri ?colLabel
          }
        UNION
          { SELECT DISTINCT ?item ?itemId ?itemType ?itemLabel ?itemThumb
            WHERE
              { SELECT DISTINCT  ?item ?itemId ?itemType ?itemThumb
                (GROUP_CONCAT( concat('"',?itemLabels,'"@',lang(?itemLabels)); separator="|" ) as ?itemLabel)
                WHERE
                  { VALUES ?id { "${id}" }
                    ?uri   dct:identifier  ?id .
                    ?item  dct:isPartOf    ?uri ;
                      rdf:type        ?itemType .
                    ?itemType (rdfs:subClassOf)* bibo:Document .
                    ?item  dct:identifier  ?itemId ;
                          dct:title       ?itemLabels ;
                          ubbont:hasThumbnail ?itemThumb .
                  }
                GROUP BY ?item ?itemType ?itemId ?itemLabel ?itemThumb
                ORDER BY ?itemId
              }
          }
      }
    ORDER BY ?itemId 
  `

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}&output=json`, { headers: { 'Accept-Encoding': 'gzip' } }
  )
  return results
}

const getItems = (items) => {
  const data = items.map(item => {
    return {
      "id": `${getBaseUrl()}/items/${item.identifier}/manifest`,
      "type": "Manifest",
      "label": labelSplitter(item.label),
      "thumbnail": [
        {
          id: item.thumbnail.value ?? item.thumbnail,
          type: "Image",
          format: "image/jpeg",
          width: 250,
          height: 250
        }
      ],
      "homepage": [
        {
          "id": item['@id'].replace("http://data.ub", "https://marcus"),
          "type": "Text",
          "label": labelSplitter(item.label)
        }
      ]
    }
  })

  return data
}

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  await runMiddleware(req, res, cors)

  switch (method) {
    case 'GET':
      const response = await getData('https://sparql.ub.uib.no/sparql/query?query=', id)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.json()
        //console.log(JSON.stringify(result, null, 2))
        //res.status(200).json(result)

        if (!result['@graph']?.some(o => o['sc:summary'])) {
          res.status(200).json({ message: 'No items' })
          return
        }

        const count = result['@graph'].filter(o => o['sc:summary'])[0]['sc:summary']
        const collectionLabel = result['@graph'].filter(o => o['sc:summary'])[0]['label']
        const filteredItems = result['@graph'].filter(o => !o['sc:summary'])
        const sortedItems = sortBy(filteredItems, ["identifier"])
        const items = getItems(sortedItems)

        let collection = {
          "@context": ["https://iiif.io/api/presentation/3/context.json"],
          "id": `${getBaseUrl()}/collections/${id}`,
          "type": "Collection",
          "label": collectionLabel,
          "summary": {
            "no": [
              `${count} resultat`
            ]
          },
          "items": items,
          "partOf": [
            {
              "id": `${getBaseUrl()}/collections`,
              "type": "Collection"
            }
          ]
        }

        // We assume all @none language tags are really norwegian
        collection = JSON.parse(JSON.stringify(collection).replaceAll('"@none":', '"no":'))

        res.status(200).json(collection)
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
