export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryText = searchParams.get('q') || '';
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset || 'all'  // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)
  const collapse = filteredParams.collapse

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(dataset)
  }

  // Create fuzzy query instead of simple_query_string
  let fuzzyQuery = null;
  if (queryText) {
    fuzzyQuery = {
      bool: {
        should: [
          // Exact match with higher boost
          {
            query_string: {
              query: queryText,
              fields: ["label^8", "altLabels^6", "attestations.label^4"],
              default_operator: "OR"
            }
          },
          // Fuzzy match with lower boost
          {
            multi_match: {
              query: queryText,
              fields: ["label^4", "altLabels^3", "attestations.label^2"],
              fuzziness: "AUTO",
              prefix_length: 1,
              max_expansions: 50
            }
          }
        ],
        minimum_should_match: 1
      }
    };
  }

  const query: Record<string,any> = {
    "track_total_hits": 10000000,
    "size":  termFilters.length == 0 && !simple_query_string ? 0 : filteredParams.size  || 10,
    ...filteredParams.from ? {from: filteredParams.from} : {},
    ...highlight ? {highlight} : {},
    
    "track_scores": true,
    ...(collapse ? {
      "collapse": {
        "field": collapse,
        "inner_hits": {
          "name": collapse,
          "size": 1000,
          "_source": "false",
          "fields": ["label", "uuid", "sosi", "description"]
        }
      }
    } : {}),
    "fields": [
      "group", "label", "adm1", "adm2", "uuid", "sosi", "description" // Todo: adapt to whether it's used in the search or in the show more
    ],
    "sort": [

      
      
      {
        _score: "desc"
      },
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],
    "_source": false
  }

  if (fuzzyQuery && termFilters.length) {
    query.query = {
      "bool": {
        "must": fuzzyQuery,              
        "filter": termFilters
      }
    }
  }
  else if (fuzzyQuery) {
    query.query = fuzzyQuery
  }
  else if (simple_query_string && termFilters.length) {
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

  console.log("QUERY", query)


  
  const [data, status] = await postQuery(dataset, query)
  return Response.json(data, {status: status})
  
}