export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset || 'search'  // == 'search' ? '*' : filteredParams.dataset;

  const query: Record<string,any> = {
    size: filteredParams.zoom == '18' ? 2000 : 200,
    fields: ["label", "location", "uuid", "sosi", "children"],
    _source: false,
  }
  const geo_query = {geo_bounding_box: {
    location: {
        top_left: {
          lat: filteredParams.topLeftLat,
          lon: filteredParams.topLeftLng,
        },
        bottom_right: {
          lat: filteredParams.bottomRightLat,
          lon: filteredParams.bottomRightLng,
        },
        }}
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

    const [data, status] = await postQuery(dataset, query)
    return Response.json(data, {status: status})


}