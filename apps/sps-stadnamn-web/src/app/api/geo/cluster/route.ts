export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { error } from 'console';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset || 'search' // == 'search' ? '*' : filteredParams.dataset;

  const zoomLevels  = {
    "18": 20,
    "17": 18,
    "16": 17,
    "15": 16,
    "14": 15,
    "13": 14,
    "12": 13,
    "11": 12,
    "10": 11,
    "9": 10,
    "8": 9,
    "7": 8,
    "6": 7,
    "5": 6,
    "4": 5,
  }


  const query: Record<string,any> = {
    size: 0,
    fields: ["label", "location", "uuid", "sosi", "children"],
    _source: false,
    aggs: {
        tiles: {
            geotile_grid: {
                field: "location",
                precision: filteredParams.zoom ? zoomLevels[filteredParams.zoom as keyof typeof zoomLevels] ?? 3 : 3,
                bounds: {
                    top_left: {
                        lat: filteredParams.topLeftLat,
                        lon: filteredParams.topLeftLng,
                    },
                    bottom_right: {
                        lat: filteredParams.bottomRightLat,
                        lon: filteredParams.bottomRightLng,
                    }
                }
                
            },
            aggs: {
                docs: {
                    top_hits: {
                        size: filteredParams.zoom ? parseInt(filteredParams.zoom) == 18 ? 100 : parseInt(filteredParams.zoom) > 15 ? 10 : 3 : 3,
                        _source: ["label", "uuid"]

                        }
                    },
                    viewport: {
                        geo_bounds: {
                            field: "location"
                        }
                    }
                }
            }

        }
    }
    if (simple_query_string || termFilters.length) {
        query.query = {
            "bool": {}
        }

        if (simple_query_string) {
            query.query.bool.must = [simple_query_string]
        }
        
        if (termFilters.length) {
            query.query.bool.filter = termFilters
        }
    }
    else {
        query.query = { match_all: {} }
    }

  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
}