export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/fetch';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;

  const query: Record<string,any> = {
    size: 200,
    fields: ["label", "location"],
    _source: false,
}

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

  const data = await postQuery(dataset, query)

  return Response.json(data);
}