//export the runtime = 'edge'

import { extractFacets } from '../../_utils/facets';
import { postQuery } from '../../_utils/post';
import { getQueryString } from '../../_utils/query-string';

export async function POST(request: Request) {
  const { size, from, initLocation } = await request.json()
  const { termFilters, reservedParams } = extractFacets(request)
  const { highlight, simple_query_string } = getQueryString(reservedParams)

  const sortPreference = reservedParams.searchSort === 'similarity' ? 'similarity' : 'distance'

  const baseSort: any[] = []

  if (reservedParams.datasetTag == 'base') {
    baseSort.push({ 'group.id': "asc" }, { 'label.keyword': "asc" })
  } else {
    if (sortPreference === 'similarity') {
      // Likskap: 1. score, 2. boost
      if (reservedParams.q) {
        baseSort.push({ _score: "desc" })
      }
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
    } else {
      // Avstand: 1. avstand, 2. boost, 3. score
      if (initLocation) {
        baseSort.push({
          _geo_distance: {
            location: initLocation,
            order: "asc"
          }
        })
      }
      baseSort.push({
        boost: {
          order: "desc",
          missing: "_last"
        }
      })
      if (reservedParams.q) {
        baseSort.push({ _score: "desc" })
      }
    }
  }

  const query: Record<string, any> = {
    "size": size || 10,
    ...from ? { from } : {},
    ...highlight ? { highlight } : {},
    "track_scores": true,
    "fields": ["group.adm1", "group.adm2", "adm1", "adm2", "group.label", "uuid", "boost", "label", "location"],
    "collapse": {
      "field": "group.id",
    },
    "sort": baseSort,
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
    baseQuery = {
      "bool": {
        "must": simple_query_string
      }
    }
  }
  else if (termFilters.length) {
    baseQuery = {
      "bool": {
        "filter": termFilters
      }
    }
  }
  else {
    baseQuery = {
      "bool": {
        "must": { "match_all": {} }
      }
    }
  }

  query.query = baseQuery;

  /*

  

  if (simple_query_string || initGroup?.id) {
    query.query = {
      "function_score": {
        "query": baseQuery,
        "functions": [],
        "boost_mode": "multiply",
        "score_mode": "multiply"
      }
    }
  }
  else {
    query.query = baseQuery;
  }
  
  // Apply function score to properly balance text relevance with boost field
  if (simple_query_string) {
    query.query.function_score?.functions.push({
            "field_value_factor": {
              "field": "boost",
              "factor": 1,
              "missing": 1
            }
          })

          query.query.function_score?.functions?.push({
            filter: { term: { "label": reservedParams.q } },
            weight: 10
          })
    }

    

    if (initGroup?.id) {
      query.query.function_score?.functions?.push({
              filter: { term: { "group.id": initGroup.id } },
              weight: 100       // boost the initial group very high
            })
      }
      

  
  
      // Bump items without location within same adm, or bump items within same adm if the init group has no location
      if (simple_query_string && initGroup?.adm1) {
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
      */

      console.log(JSON.stringify(query, null, 2))

  const [data, status] = await postQuery('all', query, "dfs_query_then_fetch")
  return Response.json(data, { status: status })

}