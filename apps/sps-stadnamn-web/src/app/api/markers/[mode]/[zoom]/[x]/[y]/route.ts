import { extractFacets } from '@/app/api/_utils/facets'
import { getQueryString } from '@/app/api/_utils/query-string'
import { postQuery } from '@/app/api/_utils/post'
import type { NextRequest } from 'next/server'


 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ zoom: string, x: string, y: string }> }
) {
  const { zoom, x, y} = await params


  const { termFilters, reservedParams } =  extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const perspective = reservedParams.perspective || 'all'
  



  const query: Record<string, any> = {
    size: 0,
    fields: ["label", "location", "uuid", "sosi", "placeScore", "group.id"],
    collapse: {
      field: "group.id"
    },
    _source: false,
    track_total_hits: false,
    query: {
      bool: {
        filter: [
          {
            geo_grid: {
                location: { geotile: `${zoom}/${x}/${y}` }
            }
          }
        ]
      }
    },
    aggs: {
      grid: {
        geotile_grid: {
          field: "location",
          size: 500,
          precision: zoom == "0" ? 6 : parseInt(zoom) + 4
        },
        aggs: {
          top: {
            top_hits: {
              size: 4,
              _source: false,
              fields: ["label", "location", "uuid", "sosi", "placeScore", "group.id"]
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

  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, { status: status })
}