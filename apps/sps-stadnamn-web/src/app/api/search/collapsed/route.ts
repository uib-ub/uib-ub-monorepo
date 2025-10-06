//export the runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { base64UrlToString } from '@/lib/param-utils';

export async function POST(request: Request) {
  const {size, from, perspective, initGroup, labelBounds} = await request.json()
  const {termFilters, reservedParams} = extractFacets(request)
  const { highlight, simple_query_string } = getQueryString(reservedParams)


  const query: Record<string,any> = {
    "size":  size  || 10,
    ...from ? {from} : {},
    ...highlight ? {highlight} : {},
    "track_scores": true,
    "track_total_hits": false,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost", "label"],
    "collapse": {
      "field": "group.id",
    },
    
    "sort": reservedParams.datasetTag == 'base' ?
    [{'group.id': "asc"}, {'label.keyword': "asc"}]
    : [
      ...false && reservedParams.sortPoint ? [{
        _geo_distance: {
          location: reservedParams.sortPoint,
          order: "asc"
        }
      }] : [],
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
    query.query = { "match_all": {} }
  }

  if (initGroup) {
    const baseQuery = {...query.query}  // your existing query
  
    query.query = {
      function_score: {
        query: baseQuery,   // evaluate your main query once
        functions: [
          {
            filter: { term: { "group.id": initGroup } },
            weight: 10       // boost the initial group very high
          },
        ],
        score_mode: "multiply",   // combine weights multiplicatively
        boost_mode: "multiply"    // multiply with base score
      }
    }

    if (labelBounds) {
      // labelBounds is a comma separated string: "north,west,south,east"
      // Example: "59.80063426102869,9.953613281250002,59.130863097255904,12.810058593750002"
      const [north, west, south, east] = labelBounds.split(',').map(Number);

      // Construct geo_bounding_box in Elasticsearch format
      const geoBoundingBox = {
        location: {
          top_left: {
            lat: north,
            lon: west
          },
          bottom_right: {
            lat: south,
            lon: east
          }
        }
      };

      query.query.function_score.functions.push({
        filter: { geo_bounding_box: geoBoundingBox },
        weight: 9
      });
    }


  }

  console.log("QUERY", JSON.stringify(query, null, 2))

  
 

  // Only cache if no search string an no filters
  const [data, status] = await postQuery(perspective || 'all', query, "dfs_query_then_fetch")
  console.log("DATA", data)
  return Response.json(data, {status: status})
  
}