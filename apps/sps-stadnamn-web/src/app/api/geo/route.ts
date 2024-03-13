export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'

export async function GET(request: Request) {
    const {term_filters, params} = extractFacets(request)


  const dataset = params.dataset == 'search' ? '*' : params.dataset;


  const query: Record<string,any> = {
    size: 200,
    fields: ["label", "location"],
    _source: false,
    sort: [
        {
        "uuid.keyword": {
            order: "asc"
        }
        }
    ],
}

const geo_query = {geo_bounding_box: {
    location: {
        top_left: {
          lat: params.topLeftLat ? parseFloat(params.topLeftLat) : 90,
          lon: params.topLeftLng ? parseFloat(params.topLeftLng) : -180,
        },
        bottom_right: {
          lat: params.bottomRightLat ? parseFloat(params.bottomRightLat) : -90,
          lon: params.bottomRightLng ? parseFloat(params.bottomRightLng) : 180,
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


const simple_query_string = params.q ? {
    "simple_query_string": {
      "query": params.q,
      "fields": ["label"]
    }} : null


  


if (simple_query_string || term_filters.length) {
    query.query = {
        "bool": {
            "must": [geo_query],
        }
    }
    if (simple_query_string) {
        query.query.bool.must.push(simple_query_string)
    }
    if (term_filters.length) {
        query.query.bool.filter = term_filters
    }
}
else {
    query.query = geo_query
}

let res
try {
  res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${dataset}-demo/_search`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
    }
  });

  if (!res.ok) {
    return new Response(`Request failed with status ${res.status}`, { status: res.status });
  }
  } catch (error) {
    return new Response(`Request failed with error: ${error}`, { status: 500 });
  }

  const data = await res?.json()

  return Response.json(data);
}