//export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }

    
  const query: Record<string,any> = {
    "size":  reservedParams.size  || 10,
    ...reservedParams.from ? {from: reservedParams.from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "track_total_hits": false,
    "collapse": {
      "field": "group.id",
      "inner_hits": {
        "name": "group",
        "size": 0,
      }
    },
    "fields": [ "boost",
      "group.id", "label", "group.adm1", "group.adm2", "uuid", "sosi", "description", "altLabels", "attestations.label", // Todo: adapt to whether it's used in the search or in the show more
    ],
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
  else {
    query.query = {
      "match_all": {}
    }
  }


  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch", !simple_query_string)
  return Response.json(data, {status: status})
  
}