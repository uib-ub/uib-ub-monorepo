export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { FaGalacticSenate } from 'react-icons/fa';

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(filteredParams)
  const dataset = filteredParams.dataset || 'search' // == 'search' ? '*' : filteredParams.dataset;

  const sortArray = getSortArray(dataset)
  const zoom = parseInt(filteredParams.zoom)
  const totalHits = filteredParams.totalHits
  console.log(filteredParams.bottomRightLat, filteredParams.bottomRightLng)
  

  const zoomLevels  = {
    "18": 26,
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
    "6": 6,
    "5": 5,
    "4": 4,
  }

    const placeScoreThresholds = {
    4: 4,
    5: 4,
    6: 4,
    7: 4,
    8: 3,
    9: 3,
    10: 3,
    11: 2,
    12: 2,
    13: 1,
  };

  const currentPlaceScoreThreshold = placeScoreThresholds[zoom as keyof typeof placeScoreThresholds];


  const aggs = {
    tiles: {
        geotile_grid: {
            field: "location",
            precision: filteredParams.zoom ? zoomLevels[filteredParams.zoom as keyof typeof zoomLevels] ?? 3 : 3,
            //shard_size: 1

            
        },
        aggs: {
            docs: {
                top_hits: {
                    _source: ["label", "uuid"],
                    size: zoom < 6 ? 20 : zoom == 18 ? 100 : 10,//topHitsSize[filteredParams.zoom as keyof typeof topHitsSize] ?? 20,
                    sort: dataset == 'search' ? [
                        {"ranking": "asc"}, 
                        {"uuid": "asc"}
                    ] : {"uuid": "asc"} 
                    
                    }
                },
                viewport: {
                    geo_bounds: {
                        field: "location"
                    },
                }
            }
        }
    }


  const query: Record<string,any> = {
    size: 0,
    fields: ["label", "location", "uuid", "sosi", "children"],
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
          ...dataset === 'search' && currentPlaceScoreThreshold && !simple_query_string && !termFilters.length ? [{
            range: {
              placeScore: {
                gte: currentPlaceScoreThreshold
              }
            }
          }] : []
        ]
      }
    },
    aggs: zoom < 6 || zoom > 16 || parseInt(totalHits) < 10000 ? aggs : { 
      sample: {
        sampler: {
          shard_size: 300
        },
        aggs
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

  console.log("QUERY", query)
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
}