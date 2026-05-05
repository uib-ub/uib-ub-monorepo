import { postQuery } from '../_utils/post'

type Adm2AggBucket = { key: string; doc_count?: number }
type AdmContextAggBucket = { key: string; doc_count?: number; adm2?: { buckets?: Adm2AggBucket[] } }

export type AdmContextAggResponse = {
  adm1?: {
    buckets?: AdmContextAggBucket[]
  }
}

// Hard-coded radius for "context" lookups around `point` (meters).
const CONTEXT_RADIUS = "2km"

function parsePoint(point: string | null): [number, number] | null {
  if (!point) return null
  const parts = point.split(',').map((s) => parseFloat(s))
  if (parts.length !== 2) return null
  const [lat, lon] = parts
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  // ES expects [lon, lat]
  return [lon, lat]
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pointRaw = url.searchParams.get('point')

  const point = parsePoint(pointRaw)

  // Context is derived only from `point`.
  if (!point) {
    return Response.json({ aggs: { adm1: { buckets: [] } } satisfies AdmContextAggResponse }, { status: 200 })
  }

  const geoFilter = {
    geo_distance: {
      distance: CONTEXT_RADIUS,
      location: point,
    },
  }

  const query: Record<string, any> = {
    size: 0,
    track_total_hits: false,
    query: {
      bool: {
        filter: [geoFilter],
      },
    },
    aggs: {
      adm1: {
        terms: {
          field: 'adm1.keyword',
          size: 50,
        },
        aggs: {
          adm2: {
            terms: {
              field: 'adm2.keyword',
              size: 50,
            },
          },
        },
      },
    },
  }

  const [data, status] = await postQuery('all', query, 'dfs_query_then_fetch')
  const aggs: AdmContextAggResponse = data?.aggregations ?? { adm1: { buckets: [] } }

  return Response.json({ aggs }, { status })
}

