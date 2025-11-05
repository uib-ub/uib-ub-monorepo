import { extractFacets } from '@/app/api/_utils/facets'
import { getQueryString } from '@/app/api/_utils/query-string'
import { postQuery } from '@/app/api/_utils/post'
import { NextRequest } from 'next/server'

 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mode:string, zoom: string, x: string, y: string }> }
) {
  const { mode, zoom: precision, x, y} = await params



  const { termFilters, reservedParams } =  extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const perspective = reservedParams.perspective || 'all'
  const totalHits = reservedParams.totalHits ? parseInt(reservedParams.totalHits) : undefined

  console.log("DEBUG IN GRID", reservedParams.debug)
  
  const query: Record<string, any> = {
    size: 0,

    _source: false,
    track_total_hits: false,
    track_scores: false,
    //sort: [{"group.placeScore": {order: "desc", missing: "_last"}}, { "boost": {order: "desc", missing: "_last"}}, { "group.id": {order: "asc", missing: "_last"}} ],
    
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
          size: 200,
          precision: precision == "0" ? 6 : parseInt(precision) + 3
        },
        "aggs": {
          "groups": {
            "terms": {
              "field": "group.id",
              "order": { "max_placeScore": "desc"},
              size: (Number(precision) > 17 || (totalHits && totalHits < 10000)) ? 500 : 10,
            },
            "aggs": {
              "max_placeScore": {
                "max": { "field": "group.placeScore" }
              },
              "top": {
                "top_hits": {
                  "size": 1,
                  "_source": false,
                  "fields": ["label", "location", "group.id", "uuid"],
                }
              },
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
  console.log("PERSPECTIVE", perspective)


  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")
  return Response.json(data, { status: status })
}