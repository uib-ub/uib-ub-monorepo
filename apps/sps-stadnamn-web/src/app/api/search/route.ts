export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
export async function GET(request: Request) {
  const {term_filters, params} = extractFacets(request)
  const dataset = params.dataset == 'search' ? '*' : params.dataset;

  const query: Record<string,any> = {
    "from": params.page ? (parseInt(params.page) - 1) * parseInt(params.size || '10') : 0,
    "size": params.size  || 10,
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

  const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": ["label"]
    }} : null



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

  const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  })

  const data = await res.json()

  return Response.json(data);
}