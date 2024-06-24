export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/fetch';
export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  const sortArray = []

  if (filteredParams.sort) {
    const fields = filteredParams.orderBy?.split(',') || ['label.keyword'];
    for (const field of fields) {
      const nestedFields = field.split('__');
      const order = filteredParams.sort == 'desc' ? 'desc' : 'asc';
      if (nestedFields.length > 1) {
        sortArray.push({
          [`${nestedFields[0]}.${nestedFields[1]}`]: {
            "order": order,
            "nested": {
              "path": nestedFields[0]
            }
          }
        });
      } else {
        sortArray.push({
          [`${field}`]: {
            "order": order,
            "missing": "_first"
          }
        });
      }
    }
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