export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  const query: Record<string,any> = {
    "from": filteredParams.page ? (parseInt(filteredParams.page) - 1) * parseInt(filteredParams.size || '10') : 0,
    "size": filteredParams.size  || 10,
    ...highlight ? {highlight} : {},
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },

      }
    },
    "sort": [
      {
        "label.keyword": {
        "order": filteredParams.sort == 'desc' ? 'desc' : 'asc'
        }
      }
    ]
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }

  //console.log("QUERY", JSON.stringify(query))

  const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  })

  const data = await res.json()
  //console.log("DATA", data)

  return Response.json(data);
}