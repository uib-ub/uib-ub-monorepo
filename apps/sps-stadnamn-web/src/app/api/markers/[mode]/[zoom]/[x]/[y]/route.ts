import { extractFacets } from '@/app/api/_utils/facets'
import { getQueryString } from '@/app/api/_utils/query-string'
import { postQuery } from '@/app/api/_utils/post'
import type { NextRequest } from 'next/server'


 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ mode:string, zoom: string, x: string, y: string }> }
) {
  const { mode, zoom: precision, x, y} = await params


  const { termFilters, reservedParams } =  extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const perspective = reservedParams.perspective || 'all'
  



  const query: Record<string, any> = {
    size: 0,
    collapse: {
      field: "group.id"
    },
    _source: false,
    track_total_hits: false,
    track_scores: false,
    
    query: {
      bool: {
        filter: [
          {
            geo_grid: {
                location: { geotile: `${precision}/${x}/${y}` }
            }
          },
        ]
      }
    },
    aggs: {
      grid: {
        geotile_grid: {
          field: "location",
          size: 1000,
          precision: precision == "0" ? 6 : parseInt(precision) + 4
        },
        aggs: {
          top: {
            top_hits: {
              size: Number(precision) > 17 ? 1000 : 2,
              sort: [ { "uuid": "asc" } ],
              _source: false,
              fields: ["label", "location", "group.id", "uuid"],
            }
          }
        }
      }
    }
  }

  if (simple_query_string || termFilters.length) {
    if (simple_query_string) {
      query.query.bool.must = [simple_query_string]
    }
    if (termFilters.length) {
      query.query.bool.filter.push(...termFilters)
    }
  }

  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch", true)
  return Response.json(data, { status: status })
}