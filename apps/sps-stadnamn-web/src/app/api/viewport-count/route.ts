import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';

function parseNumberParam(url: URL, key: string): number | null {
  const raw = url.searchParams.get(key)
  if (raw == null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  // Geographic bounds of the *padded* viewport, in degrees.
  // Required params:
  // - north, west, south, east
  const north = parseNumberParam(url, 'north')
  const west = parseNumberParam(url, 'west')
  const south = parseNumberParam(url, 'south')
  const east = parseNumberParam(url, 'east')

  if (north == null || west == null || south == null || east == null) {
    return Response.json(
      { error: 'Missing required params: north, west, south, east' },
      { status: 400 }
    )
  }

  // The bounds params are *not* real search facets; strip them before running facet extraction.
  const cleanedUrl = new URL(request.url)
  for (const key of ['north', 'west', 'south', 'east']) {
    cleanedUrl.searchParams.delete(key)
  }
  const cleanedRequest = new Request(cleanedUrl.toString(), request)
  const { termFilters, reservedParams } = extractFacets(cleanedRequest)
  const perspective = reservedParams.perspective || 'all'
  const { simple_query_string } = getQueryString(reservedParams)

  const viewportFilter = {
    geo_bounding_box: {
      location: {
        top_left: { lat: north, lon: west },
        bottom_right: { lat: south, lon: east },
      },
    },
  }

  const boolQuery: any = { }
  const filter: any[] = [...termFilters, viewportFilter]
  if (filter.length) boolQuery.filter = filter
  if (simple_query_string) boolQuery.must = simple_query_string
  if (!simple_query_string && !filter.length) boolQuery.must = { match_all: {} }

  const query: Record<string, any> = {
    track_total_hits: 10000000,
    track_scores: false,
    size: 0,
    query: { bool: boolQuery },
    aggs: {
      // Count unique namnegrupper (group.id) within the padded viewport
      groups: {
        cardinality: {
          field: "group.id",
        },
      },
    },
    _source: false,
  }

  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, { status })
}

