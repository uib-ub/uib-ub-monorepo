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



  const calculateProbability = (totalHits: number, zoom: number): number => {

    if (!zoom || zoom < 7 || zoom > 15 || totalHits < 100000) {
      return 1
    }

    if (totalHits < 200000 && zoom > 12) {
      return 1
    }

    // Return 1 if bottom of the screen above Norway or showing yan mayen
    // Bottom right for yan mayen: 67.68445072846762 12.568359375000002
    if (filteredParams.bottomRightLat && parseFloat(filteredParams.bottomRightLat) > 71
      ||
      (filteredParams.bottomRightLng && parseFloat(filteredParams.bottomRightLng) < 12.568359375000002 && parseFloat(filteredParams.bottomRightLat) > 67.68445072846762)
  
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
    console.log("TARGET POINTS", targetPoints)
    
    // Calculate probability to get roughly targetPoints
    const probability = targetPoints / Number(totalHits);
    
    // Clamp probability to either 1 or between 0.001 and 0.5
    return Math.min(Math.max(probability, 0.001), 0.5);
  }

  const probability = calculateProbability(Number(totalHits), zoom)
  console.log("PROBABILITY", probability)
  //console.log("TOTAL HITS", totalHits)

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
                    size: 10,//topHitsSize[filteredParams.zoom as keyof typeof topHitsSize] ?? 20,
                    sort: dataset == 'search' ? [{"ranking": "asc"}, {"uuid": "asc"}] : {"uuid": "asc"} //sortArray.filter(sort => sort !== "_score")
                    
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
        filter: [{
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
        }]
      }
    },
    aggs: probability == 1 ? aggs : { // filteredParams.markerSample == 'false' || zoom < 7
      sample: {
        
        /*
        sampler: {
          shard_size: 300
        },
        */
        
        
        
        
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