
import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { simple_query_string } = getQueryString(reservedParams)
    
  const suppressedExclusion = {
    "terms": {
      "group.id": ["suppressed", "noname"]
    }
  };

  const query: Record<string,any> = {
    "track_total_hits": 10000000,
    "track_scores": false,
    "size":  0,
      "aggs": {
        "viewport": {
          "geo_bounds": {
            "field": "location",
            "wrap_longitude": true
          },
        }
      },
    "_source": false
  }


  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else if (simple_query_string) {
    query.query = {
      "bool": {
        "must": simple_query_string,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters,
        "must_not": [suppressedExclusion]
      }
    }
  }
  else {
    query.query = {
      "bool": {
        "must": { "match_all": {} },
        "must_not": [suppressedExclusion]
      }
    }
  }

  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, {status: status})
  
}