import { extractFacets } from "../../_utils/facets"
import { postQuery } from "../../_utils/post"
import { getQueryString } from "../../_utils/query-string"

export async function GET(request: Request) {
  const { reservedParams, datasets } = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams, { datasets })

  // Get sort parameter from query string
  const url = new URL(request.url)
  const sortParam = url.searchParams.get('sort')
  const sizeParam = url.searchParams.get('size')
  const size = sizeParam ? parseInt(sizeParam, 10) : 100

  // Use correct reserved params (from facets.ts)
  const filters: any[] = [];
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

  // Determine sort based on parameter
  // If no sort param, sort by uuid asc for random distribution
  // If sort='uuid', sort by child_count desc for top UUID count, then by uuid asc for tie-breaking
  // If sort='h3', sort by h3_count desc for top H3 count, then by uuid asc for tie-breaking
  let sort: any[] = [];
  if (sortParam === 'h3') {
    sort = [
      { 'misc.h3_count': "desc" },
      { 'uuid': { order: 'asc' } } // Tie-breaker: sort by UUID ascending for consistent ordering
    ];
  } else if (sortParam === 'uuid') {
    sort = [
      { 'misc.child_count': "desc" },
      { 'uuid': { order: 'asc' } } // Tie-breaker: sort by UUID ascending for consistent ordering
    ];
  } else {
    // Default: sort by uuid asc for even distribution/randomization
    sort = [{ 'uuid': {order: 'asc'}}];
  }

  const query: Record<string, any> = {
    "size": size,
    "track_scores": false,
    "query": queryPart,
    "sort": sort,
    "_source": true
  };
    

  const [data, status] = await postQuery('core_group_debug', query)
  return Response.json(data, {status: status})
  
}



export async function POST(request: Request) {
  const { children } = await request.json()

  const query: Record<string, any> = {
    "size": 1000,
    "track_scores": false,
    "_source": true,
    "query": {
      "bool": {
        "filter": {
          "terms": {
            "uuid": children
          }
        }
      }
    }
  }

    const [data, status] = await postQuery('all', query)
    return Response.json(data, {status: status})



  }
  