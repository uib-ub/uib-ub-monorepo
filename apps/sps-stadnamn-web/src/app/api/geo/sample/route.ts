export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray, treeSettings } from '@/config/server-config';
import { FaGalacticSenate } from 'react-icons/fa';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset || 'search' // == 'search' ? '*' : filteredParams.dataset;

  const sortArray = getSortArray(dataset)
  const zoom: number = parseInt(filteredParams.zoom)
  const totalHits = filteredParams.totalHits

  const zoomSize: Record<number, number> = { 16: 300, 17: 600, 18: 2000}


  const query: Record<string,any> = {
    size: zoomSize[zoom] || 200,
    fields: ["label", "location", "uuid", "sosi", "children", "placeScore", "within"],
    track_total_hits: false,
    collapse: {
      field: "group"
    },
    sort: dataset === 'search' ? [
      /*
      {
        "placeScore": "desc"
      },
      {
        "ranking": "asc"
      },
      */
      {
        "uuid": "asc"
      }
    ] : treeSettings[dataset]?.geoSort ? [
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
        ]
      }
    },
    aggs: {
      viewport: {
        geo_bounds: {
            field: "location"
        },
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

  //console.log("QUERY", query)
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
}