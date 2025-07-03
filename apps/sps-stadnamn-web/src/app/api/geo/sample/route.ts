export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { treeSettings } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset || 'search' // == 'search' ? '*' : filteredParams.dataset;

  const zoom: number = parseInt(filteredParams.zoom)

  const zoomSize: Record<number, number> = { 16: 300, 17: 600, 18: 2000}


  const query: Record<string,any> = {
    size: zoomSize[zoom] || 200,
    fields: ["label", "location", "uuid", "sosi", "children", "placeScore", "within"],
    track_total_hits: false,
    collapse: {
      field: "group"
    },
    sort: treeSettings[dataset]?.geoSort ? [
      {
        [treeSettings[dataset].geoSort]: {
          "missing": "_first",
          "order": "asc"
        },
        "uuid": "asc"
      }
    ] : [{
      "uuid": "asc"
    }],
    

    _source: false,
    query: {
      bool: {
        filter: [
          {
            geo_bounding_box: {
              location: {
                top_left: {
                  lat: filteredParams.topLeftLat,
                  lon: filteredParams.topLeftLng,
                },
                bottom_right: {
                  lat: filteredParams.bottomRightLat,
                  lon: filteredParams.bottomRightLng,
                }
              }
            }
          },
          {
            range: {
              boost: {
                gte: 4
              }
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
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
}