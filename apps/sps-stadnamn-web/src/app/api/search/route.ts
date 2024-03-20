export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
export async function GET(request: Request) {
  const {term_filters, params} = extractFacets(request)
  const dataset = params.dataset == 'search' ? '*' : params.dataset;
  const { highlight, simple_query_string } = getQueryString(params)

  const query: Record<string,any> = {
    "from": params.page ? (parseInt(params.page) - 1) * parseInt(params.size || '10') : 0,
    "size": params.size  || 10,
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
        "order": params.sort == 'desc' ? 'desc' : 'asc'
        }
      }
    ]
  }

  if (simple_query_string && term_filters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "filter": term_filters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (term_filters.length) {
    query.query = {"bool": {
        "filter": term_filters
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