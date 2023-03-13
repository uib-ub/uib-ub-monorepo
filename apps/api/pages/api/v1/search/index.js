import { sortBy } from 'lodash'
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

/**
 * labelSplitter is a functions for handeling concatinated, multilingual strings. For SPARQL to calculate
 * offset and limit correctly each item in the set needs to be on one line.
 * @param {string} label 
 * @returns {object}
 */
const labelSplitter = (label) => {
  const splitted = label.split('|')
  const data = splitted.map(l => {
    const langArr = l.split('@')
    return {
      [langArr[1] ? `@${langArr[1]}` : '@none']: [langArr[0].replaceAll("\"", "")]
    }
  })
  return data[0]
}

async function getData(url, page = 0) {
  // Calculate the offset based on the requested page. NOTE, a page without a page params,
  // or one with values 0 or 1 will result in the same list. 
  const offset = page <= 0 ? 0 : (page - 1) * 10

  const query = `
    ${SPARQL_PREFIXES}
    CONSTRUCT 
      { 
        <https://api-ub.vercel.app/collections/ubb> iiif_prezi:summary ?count .
        ?item a bibo:Collection ;
          rdfs:label ?colLabel ;
          dct:identifier ?colId ;
          sc:thumbnail ?colLogo .
      }
    WHERE
      { 
        { SELECT (COUNT(?uri) AS ?count)
            WHERE
              { 
                ?uri a bibo:Collection .
                FILTER NOT EXISTS { ?uri dct:isPartOf ?partOf . }
              }
          }
        UNION
          { SELECT DISTINCT ?item ?colId ?colLabel ?colLogo
            WHERE
              { SELECT DISTINCT ?item ?colId ?colLogo
                (GROUP_CONCAT( concat('"',?colLabels,'"@',lang(?colLabels)); separator="|" ) as ?colLabel)
                WHERE
                  { 
                    ?item a bibo:Collection .
                    FILTER NOT EXISTS { ?item dct:isPartOf ?partOf . }
                    ?item   dct:identifier  ?colId ;
                          dct:title       ?colLabels ;
                          foaf:logo ?colLogo .
                  }
                GROUP BY ?item ?colId ?colLabel ?colLogo
                ORDER BY ?colId
              }
            OFFSET  ${offset}
            LIMIT   10
          }
      }
    ORDER BY ?colId
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
      "id": `${getBaseUrl()}/search/${item.identifier}`,
      "type": "Collection",
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
      ],
      "items": [{
        "id": `${getBaseUrl()}/search/search?id=${item.identifier}`,
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

const getPages = (total) => {
  const count = Math.ceil(total / 10);
  console.log(count)
  const pages = Array.from(Array(count).keys());

  const data = pages.map((index) => {
    return {
      id: `${getBaseUrl()}/search?page=${index + 1}`,
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
    query: { page },
    method,
  } = req

  await runMiddleware(req, res, cors)

  if (page && page < 0) {
    return res.status(400).json({ message: 'Page parameter must be a positive number.' })
  }

  switch (method) {
    case 'GET':
      const response = await getData('https://sparql.ub.uib.no/sparql/query?query=', page)

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
          getPages(count)


        let collection = {
          "@context": ["https://iiif.io/api/presentation/3/context.json"],
          "id": `${getBaseUrl()}/search${page ? `?page=${page}` : ''}`,
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
              "id": `${getBaseUrl()}/search`,
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
