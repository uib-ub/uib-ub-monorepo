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
  const sourceView = reservedParams.sourceView === 'on'
  const markerIdField = sourceView ? 'uuid' : 'group.id'


  const query: Record<string, any> = {
    size: 0,

    _source: false,
    track_total_hits: true,
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
          precision: precision == "0" ? 5 : parseInt(precision) + (reservedParams.isMobile === 'on' ? 2 : 3)
        },
        "aggs": {
          "centroid": {
            "geo_centroid": {
              "field": "location"
            }
          },
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
              size: reservedParams.markerClusterSize
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