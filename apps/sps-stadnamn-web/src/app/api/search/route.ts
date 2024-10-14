export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { getSortArray } from '@/config/server-config';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic
  if (filteredParams.display == 'table') {
    if (filteredParams.asc) {
      filteredParams.asc.split(',').forEach((field: string) => {
      if (field.includes('__')) {
        // Handle nested sorting for ascending order
        sortArray.push({
          [field.replace("__", ".")]: {
            "order": "asc",
            "nested": { path: field.split('__')[0] }
          }
        });
      } else {
        // Non-nested sorting
        sortArray.push({[field]: 'asc'});
      }
    });
    }
    if (filteredParams.desc) {
      filteredParams.desc.split(',').forEach((field: string) => {
      if (field.includes('__')) {
        // Handle nested sorting for descending order
        sortArray.push({
          [field.replace("__", ".")]: {
            "order": "desc",
            "nested": { path: field.split('__')[0] }
          }

      
        });
      } else {
        // Non-nested sorting
        sortArray.push({[field]: 'desc'});
      }
    });

    }
  }

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

    
  const query: Record<string,any> = {
    "from": filteredParams.from ? parseInt(filteredParams.from) 
      : filteredParams.page ? (parseInt(filteredParams.page) - 1) * parseInt(filteredParams.size || '10') : 0,
    "size":  termFilters.length == 0 && !simple_query_string ? 0 : filteredParams.size  || 10,
    ...highlight ? {highlight} : {},
    ...(!filteredParams.from ? { // Calculating viewport is not necessary when paginating
      "aggs": {
        "viewport": {
          "geo_bounds": {
            "field": "location",
            "wrap_longitude": true
          },
        }
      }
    } : {}),
    "sort": sortArray
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }

  //console.log("QUERY", JSON.stringify(query, null, 2))

  const data = await postQuery(dataset, query)

  //console.log("DATA", data.hits.hits.length)

  return Response.json(data);
}