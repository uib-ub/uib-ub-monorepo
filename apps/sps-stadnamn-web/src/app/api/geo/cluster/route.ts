export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';
import { FaGalacticSenate } from 'react-icons/fa';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  const dataset = reservedParams.dataset || 'search' // == 'search' ? '*' : reservedParams.dataset;

  const sortArray = getSortArray(dataset)
  const zoom = parseInt(reservedParams.zoom)
  const totalHits = reservedParams.totalHits
  //console.log(reservedParams.bottomRightLat, reservedParams.bottomRightLng)
  

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


  const calculateProbability = (totalHits: number, zoom: number): number => {

    if (!zoom || zoom < 6 || zoom > 14 || totalHits < 100000) {
      return 1
    }

    if (totalHits < 200000 && zoom > 12) {
      return 1
    }

    // Return 1 if bottom of the screen above Norway or showing yan mayen
    // Bottom right for yan mayen: 67.68445072846762 12.568359375000002
    if (reservedParams.bottomRightLat && parseFloat(reservedParams.bottomRightLat) > 71
      ||
      (reservedParams.bottomRightLng && parseFloat(reservedParams.bottomRightLng) < 12.568359375000002 && parseFloat(reservedParams.bottomRightLat) > 67.68445072846762)
  
  ) {
      return 1
    }

    // Base target for number of points to show
    let targetPoints = 1000000;

    targetPoints = {
        7: 1000,
        8: 1000,
        9: 10000,
        10: 10000,
        11: 2500,
        12: 10000,
        13: 250000,
        14: 500000,
        15: 1000000
    }[zoom] || 100000
    //console.log("TARGET POINTS", targetPoints)
    
    // Calculate probability to get roughly targetPoints
    const probability = targetPoints / Number(totalHits);
    
    // Clamp probability to either 1 or between 0.001 and 0.5
    return Math.min(Math.max(probability, 0.001), 0.5);
  }

  const probability = calculateProbability(Number(totalHits), zoom)

  const aggs = {
    tiles: {
        geotile_grid: {
            field: "location",
            precision: reservedParams.zoom ? zoomLevels[reservedParams.zoom as keyof typeof zoomLevels] ?? 3 : 3,
            //shard_size: 1

            
        },
        aggs: {
            docs: {
                top_hits: {
                    _source: ["label", "uuid"],
                    size: zoom < 6 ? 20 : zoom == 18 ? 100 : 10,//topHitsSize[reservedParams.zoom as keyof typeof topHitsSize] ?? 20,
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
                  lat: reservedParams.topLeftLat,
                  lon: reservedParams.topLeftLng,
                },
                bottom_right: {
                  lat: reservedParams.bottomRightLat,
                  lon: reservedParams.bottomRightLng,
                }
              }
            }
          },
        ]
      }
    },
    aggs: probability == 1 ? aggs : { // reservedParams.markerSample == 'false' || zoom < 7
      sample: {
        random_sampler: {
          probability,
          seed: 42
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

  //console.log("QUERY", query)
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
}