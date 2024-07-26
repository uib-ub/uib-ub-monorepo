export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { getSortArray } from '@/config/server-config';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray: any[] = []

  
  // Existing sorting logic
if (filteredParams.display == 'table') {
  if (filteredParams.asc) {
    if (filteredParams.asc.includes('__')) {
      // Handle nested sorting for ascending order
      const path = filteredParams.asc.split('__')[0];
      sortArray.push({
        [filteredParams.asc.replace("__", ".")]: {
          "order": "asc",
          "nested": {path}
        }
      });
    } else {
      // Non-nested sorting
      sortArray.push({[filteredParams.asc]: 'asc'});
    }
  }
  if (filteredParams.desc) {
    if (filteredParams.desc.includes('__')) {
      // Handle nested sorting for descending order
      const path = filteredParams.desc.split('__')[0];
      sortArray.push({
        [filteredParams.desc.replace("__", ".")]: {
          "order": "desc",
          "nested": {path}
        }

    
      });
    } else {
      // Non-nested sorting
      sortArray.push({[filteredParams.desc]: 'desc'});
    }
  }
}

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

    
  const query: Record<string,any> = {
    "from": filteredParams.page ? (parseInt(filteredParams.page) - 1) * parseInt(filteredParams.size || '10') : 0,
    "size": filteredParams.size  || 10,
    ...highlight ? {highlight} : {},
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },

      }
    },
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

  const data = await postQuery(dataset, query)

  return Response.json(data);
}