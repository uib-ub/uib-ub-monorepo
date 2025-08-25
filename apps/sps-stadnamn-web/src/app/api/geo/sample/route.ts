//export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { treeSettings } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const perspective = reservedParams.perspective || 'all' // == 'search' ? '*' : reservedParams.dataset;


  const zoom = reservedParams.zoom && parseInt(reservedParams.zoom)

  const zoomSize: Record<number, number> = { 16: 300, 17: 600, 18: 2000}


  const query: Record<string,any> = {
    size: 20,//(zoom && zoomSize[zoom]) || (reservedParams.size && parseInt(reservedParams.size)) || 10,
    fields: ["label", "location", "uuid", "sosi", "placeScore", "group.id"],
    track_total_hits: false,
    collapse: {
      field: "group.id"
    },
    sort: [
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
      {uuid: "asc"},
    ],
    

    _source: false,
    query: {
      bool: {
        filter: reservedParams.topLeftLat ? [
          {
            geo_bounding_box: {
              location: {
                top_left: {
                  lat: reservedParams.topLeftLat,
                  lon: reservedParams.topLeftLng,
                },
                bottom_right: {
                  lat: reservedParams.bottomRightLat,
                  lon: reservedParams.bottomRightLng,
                }
              }
            }
          }
        ] : [
          {
            exists: {
              field: "location"
            }
          }
        ]
      }
    },

      
    
  }

  if (simple_query_string || termFilters.length) {
    if (simple_query_string) {
      query.query.bool.must = [simple_query_string]
    }
    
    if (termFilters.length) {
      query.query.bool.filter.push(...termFilters)
    }
  }

  //console.log("QUERY", query)
  const [data, status] = await postQuery(perspective, query)
  return Response.json(data, {status: status})
}