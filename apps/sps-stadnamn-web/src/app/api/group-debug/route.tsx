import { extractFacets } from "../_utils/facets"
import { postQuery } from "../_utils/post"
import { getQueryString } from "../_utils/query-string"

export async function GET(request: Request) {
  const { reservedParams } = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)

  // Use correct reserved params (from facets.ts)
  let filters: any[] = [];
  if (reservedParams.group) {
    filters.push({ term: { "group.id": reservedParams.group } });
  }

  // Filter by bounds if present in reservedParams as required
  if (
    reservedParams.topLeftLat && reservedParams.topLeftLng &&
    reservedParams.bottomRightLat && reservedParams.bottomRightLng
  ) {
    filters.push({
      geo_bounding_box: {
        location: {
          top_left: {
            lat: parseFloat(reservedParams.topLeftLat),
            lon: parseFloat(reservedParams.topLeftLng),
          },
          bottom_right: {
            lat: parseFloat(reservedParams.bottomRightLat),
            lon: parseFloat(reservedParams.bottomRightLng),
          }
        }
      }
    });
  }

  let queryPart: any = {};
  if (simple_query_string && filters.length) {
    queryPart = {
      bool: {
        must: simple_query_string,
        filter: filters
      }
    };
  } else if (simple_query_string) {
    queryPart = simple_query_string;
  } else if (filters.length) {
    queryPart = { bool: { filter: filters } };
  } else {
    queryPart = { match_all: {} };
  }

  const query: Record<string, any> = {
    "size": 1000,
    "track_scores": false,
    "query": queryPart,
    "sort": [{ 'misc.h3_count': "desc" }, { 'misc.uuid_count': "desc" }],
    "_source": true
  };
    
 
  const [data, status] = await postQuery('core_group_debug', query, "dfs_query_then_fetch")
  return Response.json(data, {status: status})
  
}