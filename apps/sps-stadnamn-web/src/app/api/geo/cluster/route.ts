export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;

  const zoomLevels  = {
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

const geo_query = {}

/*

const geo_query = {geo_bounding_box: {
    location: {
        top_left: {
          lat: filteredParams.topLeftLat ? parseFloat(filteredParams.topLeftLat) : 90,
          lon: filteredParams.topLeftLng ? parseFloat(filteredParams.topLeftLng) : -180,
        },
        bottom_right: {
          lat: filteredParams.bottomRightLat ? parseFloat(filteredParams.bottomRightLat) : -90,
          lon: filteredParams.bottomRightLng ? parseFloat(filteredParams.bottomRightLng) : 180,
        },
    }}
}
    

// Fix invalid bounding box - lat larger than 90 is set to 90 etc
if (geo_query.geo_bounding_box.location.top_left.lat > 90) {
    geo_query.geo_bounding_box.location.top_left.lat = 90
}
if (geo_query.geo_bounding_box.location.bottom_right.lat < -90) {
    geo_query.geo_bounding_box.location.bottom_right.lat = -90
}
if (geo_query.geo_bounding_box.location.bottom_right.lon > 180) {
    geo_query.geo_bounding_box.location.bottom_right.lon = 180
}
if (geo_query.geo_bounding_box.location.top_left.lon < -180) {
    geo_query.geo_bounding_box.location.top_left.lon = -180
}
    



if (simple_query_string || termFilters.length) {
    query.query = {
        "bool": {
            "must": [geo_query],
        }
    }
    if (simple_query_string) {
        query.query.bool.must.push(simple_query_string)
    }
    if (termFilters.length) {
        query.query.bool.filter = termFilters
    }
}
else {
    query.query = geo_query
}

*/
//console.log("QUERY", query)

 

  const data = await postQuery(dataset, query)
  //console.log(data)

  return Response.json(data);
}