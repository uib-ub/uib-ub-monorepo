//export the runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }
    
  const query: Record<string,any> = {
    "size":  reservedParams.size  || 10,
    ...reservedParams.from ? {from: reservedParams.from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost"],
    "collapse": {
      "field": "group.id",
      "inner_hits": {
        "name": "group",
        "size": 3,
        "_source": false,
        "fields": [ "label", "altLabels", "attestations.label"],
      }
    },
    
    "sort": reservedParams.datasetTag == 'base' ?
    [{'group.id': "asc"}, {'label.keyword': "asc"}]
    : [
      {
        _score: "desc"
      },
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],
    "_source": false
  }

  // Construct the query part
  let baseQuery: any;
  
  if (simple_query_string && termFilters.length) {
    baseQuery = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    baseQuery = simple_query_string
  }
  else if (termFilters.length) {
    baseQuery = {"bool": {
        "filter": termFilters
      }
    }
  }
  else {
    baseQuery = {
      "match_all": {}
    }
  }
  
  // Apply function score to properly balance text relevance with boost field
  if (simple_query_string) {
    query.query = {
      "function_score": {
        "query": baseQuery,
        "functions": [
          {
            "field_value_factor": {
              "field": "boost",
              "factor": 1,
              "missing": 1
            }
          }
        ],
        "boost_mode": "multiply",
        "score_mode": "avg"
      }
    }
  } else {
    query.query = baseQuery;
  }

  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}