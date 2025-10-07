//export the runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { base64UrlToString } from '@/lib/param-utils';

export async function POST(request: Request) {
  const {size, from, perspective, initGroup, initBoost, initPlaceScore, initLabel, initLocation } = await request.json()
  const {termFilters, reservedParams} = extractFacets(request)
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  const query: Record<string,any> = {
    "size":  size  || 10,
    ...from ? {from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost", "label", "location"],
    "collapse": {
      "field": "group.id",
    },
    
    "sort": reservedParams.datasetTag == 'base' ?
    [{'group.id': "asc"}, {'label.keyword': "asc"}]
    : [
      
      {
        _score: "desc"
      },
      ...initLocation ? [{
        _geo_distance: {
          location: initLocation,
          order: "asc"
        }
      }] : [],
      
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
    query.query = { "match_all": {} }
  }

  if (initGroup?.id) {
    const baseQuery = {...query.query}  // your existing query
  
    query.query = {
      function_score: {
        query: baseQuery,   // evaluate your main query once
        functions: [
          {
            filter: { term: { "group.id": initGroup.id } },
            weight: 10       // boost the initial group very high
          }
        ],
        score_mode: "multiply",   // combine weights multiplicatively
        boost_mode: "multiply"    // multiply with base score
      }
    }

    if (initGroup.boost) {
      query.query.function_score.functions.push({
        filter: { range: { boost: { gte: initGroup.boost } } },
        weight: 1
      })
    }


    // Bump items without location within same adm, or bump items within same adm if the init group has no location
    if ( reservedParams.q?.length && initGroup?.adm1) {
      query.query.function_score.functions.push({
        filter: { 

          bool: { 
            must: [
              { term: { "group.adm1.keyword": initGroup.adm1[0] } },
              ...(initGroup.adm2 ? [{ term: { "group.adm2.keyword": initGroup.adm2[0] } }] : []),
              ...(initLocation ? [{ bool: { must_not: { exists: { field: "location" } } } }] : [])
              
            ]
          }
        },
        weight: 2
      })
    }

  }
  
 
  const [data, status] = await postQuery(perspective || 'all', query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}