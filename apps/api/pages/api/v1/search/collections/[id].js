import { sortBy } from 'lodash'
import Cors from 'cors'
import { API_URL, getBaseUrl, SPARQL_PREFIXES } from '../../../../../lib/constants'
import { runMiddleware } from '../../../../../lib/request/runMiddleware'
import { labelSplitter } from '../../../../../lib/response/labelSplitter'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

/**
 * getData
 * get all top level collections from the marcus dataset and construct a top level collection called "UBB"
 * @param {*} url 
 * @param {*} page 
 * @returns array of subcollections of constructed "UBB" collection
 */
async function getData(url, id, page = 0) {
  // Calculate the offset based on the requested page. NOTE, a page without a page params,
  // or one with values 0 or 1 will result in the same list. 
  const offset = page <= 0 ? 0 : (page - 1) * 10

  const query = `
    ${SPARQL_PREFIXES}

    CONSTRUCT 
      { 
        ?uri iiif_prezi:summary ?count .
        ?item a muna:HumanMadeObject ;
          rdfs:label ?itemLabel ;
          dct:identifier ?itemId ;
          sc:thumbnail ?itemThumb .
      }
    WHERE
      { 
        { SELECT ?uri (COUNT(?part) AS ?count)
            WHERE
              { VALUES ?id { "${id}" }
                ?uri  dct:identifier  ?id ;
                      dct:hasPart     ?part .
                ?part rdf:type/(rdfs:subClassOf)* bibo:Document .
              }
            GROUP BY ?uri
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
            OFFSET  ${offset}
            LIMIT   10
          }
      }
    ORDER BY ?itemId 
  `

  const results = await fetch(
    `${url}${encodeURIComponent(
      query,
    )}&output=json`,
  )
  return results
}

const getItems = (items) => {
  const data = items.map(item => {
    return {
      "id": `${getBaseUrl()}/items/${item.identifier}`,
      "type": "Collection",
      "label": labelSplitter(item.label),
      "thumbnail": item.thumbnail,
      "homepage": [
        {
          "id": item['@id'].replace("http://data.ub", "https://marcus"),
          "type": "Text",
          "label": labelSplitter(item.label)
        }
      ],
      "items": [{
        "id": `${getBaseUrl()}/collections/search?id=${item.identifier}`,
        "type": "Collection",
        "label": {
          no: [
            "Samlingens innhold."
          ]
        }
      }]
    }
  })

  return data
}

const getPages = (id, total) => {
  const count = Math.ceil(total / 10);
  const pages = Array.from(Array(count).keys());

  const data = pages.map((index) => {
    return {
      id: `${getBaseUrl()}/collections/${id}?page=${index + 1}`,
      type: "Collection",
      label: {
        no: [
          `Side ${index + 1} (${count} totalt)`
        ]
      }
    };
  });

  return data
}

export default async function handler(req, res) {
  const {
    query: { id, page },
    method,
  } = req

  await runMiddleware(req, res, cors)

  if (page && page < 0) {
    return res.status(400).json({ message: 'Page parameter must be a positive number.' })
  }

  switch (method) {
    case 'GET':
      const response = await getData('https://sparql.ub.uib.no/sparql/query?query=', id, page)

      // Deal with response
      if (response.status >= 200 && response.status <= 299) {
        const result = await response.json()
        //console.log(JSON.stringify(result, null, 2))
        //res.status(200).json(result)

        if (!result['@graph']?.some(o => o['sc:summary'])) {
          res.status(200).json({ message: 'No sub-collections' })
          return
        }

        const count = result['@graph'].filter(o => o['sc:summary'])[0]['sc:summary']
        const filteredItems = result['@graph'].filter(o => !o['sc:summary'])
        const sortedItems = sortBy(filteredItems, ["identifier"])
        const items = (page || count <= 10) ?
          getItems(sortedItems) :
          getPages(id, count)


        let collection = {
          "@context": ["https://iiif.io/api/presentation/3/context.json"],
          "id": `${getBaseUrl()}/collections/${id}${page ? `?page=${page}` : ''}`,
          "type": "Collection",
          "label": {
            "no": [
              `${page ? `Side ${page} (${Math.ceil(count / 10) - 1} totalt)` : 'All results'}`
            ]
          },
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
