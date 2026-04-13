import { extractFacets } from '@/app/api/_utils/facets'
import { postQuery } from '@/app/api/_utils/post'
import { getQueryString } from '@/app/api/_utils/query-string'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ precision: string, x: string, y: string }> }
) {
  const { precision, x, y } = await params



  const { termFilters, reservedParams } = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const perspective = reservedParams.perspective || 'all'
  const totalHits = reservedParams.totalHits ? parseInt(reservedParams.totalHits) : undefined
  const sourceView = reservedParams.sourceView === 'on'
  const markerIdField = sourceView ? 'uuid' : 'group.id'
  const precisionNumber = Number(precision)
  

  const precisionBreakpoints = (breakpointMap: Record<number, number>) => {
    let size = 2
    for (const [key, value] of Object.entries(breakpointMap)) {
      if (precisionNumber > Number(key)) {
        size = value
      }
    }
    return size
    
  }

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
          precision: precisionNumber > 0 ? Math.max(8, precisionNumber + (precisionNumber > 5 ? 4 : 3)) : 5
        },
        "aggs": {
          "group_count": {
            "cardinality": {
              "field": markerIdField,
              "precision_threshold": 3000
            }
          },
          "groups": {
            "terms": {
              "field": markerIdField,
              "order": { "max_placeScore": "desc" },
              "size": (
                totalHits &&
                (
                  (totalHits < 1000 && 1000) ||
                  (totalHits < 10000 && precisionBreakpoints({ 10: 100, 12: 200, 13: 1000 })) ||
                  precisionBreakpoints({ 10: 10, 12: 200, 13: 1000 })
                )
              ) || precisionBreakpoints({ 10: 5, 12: 500, 13: 1000 })
            },
            "aggs": {
              "max_placeScore": {
                "max": { "field": "group.placeScore" }
              },
              "top": {
                "top_hits": {
                  "size": 1,
                  "_source": false,
                  "fields": ["label", "location", "group.id", "uuid", "group.label", "adm1", "adm2"], // adm1 and adm2 needed for tree view
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


  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")
  return Response.json(data, { status: status })
}