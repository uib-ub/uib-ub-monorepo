export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;

  const zoomLevels  = {
    "20": 16,
    "19": 16,
    "18": 16,
    "17": 15,
    "16": 15,
    "15": 15,
    "14": 14,
    "13": 14,
    "12": 14,
    "11": 13,
    "10": 12,
    "9": 11,
    "8": 10,
    "7": 9,
    "6": 8,
    "5": 7,
    "4": 6,

  }

  const query: Record<string,any> = {
    size: 0,
    fields: ["label", "location", "uuid"],
    query: simple_query_string ? simple_query_string : { match_all: {} },
    _source: false,
    aggs: {
        tiles: {
            geotile_grid: {
                field: "location",
                precision: filteredParams.zoom ? zoomLevels[filteredParams.zoom as keyof typeof zoomLevels] ?? 3 : 3,
                bounds: {
                    top_left: {
                        lat: filteredParams.topLeftLat ? parseFloat(filteredParams.topLeftLat) : 90,
                        lon: filteredParams.topLeftLng ? parseFloat(filteredParams.topLeftLng) : -180,
                    },
                    bottom_right: {
                        lat: filteredParams.bottomRightLat ? parseFloat(filteredParams.bottomRightLat) : -90,
                        lon: filteredParams.bottomRightLng ? parseFloat(filteredParams.bottomRightLng) : 180,
                    }
                }
                
            },
            aggs: {
                docs: {
                    top_hits: {
                        size: filteredParams.zoom && parseInt(filteredParams.zoom) < 10 ? 3 : 10,
                        _source: ["label", "uuid"]

                    }
                }
            }
        }

    }
}

  const data = await postQuery(dataset, query)

  return Response.json(data);
}