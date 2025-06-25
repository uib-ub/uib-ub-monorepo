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
          "size": 0,
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

  if (simple_query_string && termFilters.length) {
    query.query = {
      "script_score": {
        "query": {
          "bool": {
            "must": simple_query_string,              
            "filter": termFilters
          }
        },
        "script": {
          "source": `
            String label = doc['label.keyword'].size() > 0 ? doc['label.keyword'].value : '';
            double boost = doc['boost'].size() > 0 ? doc['boost'].value : 1.0;
            
            if (params.queryText.length() > 0) {
              if (label.toLowerCase().equals(params.queryText.toLowerCase())) {
                return 1000 * boost;
              } else if (label.toLowerCase().contains(params.queryText.toLowerCase())) {
                return 100 * boost;
              }
            }
            return Math.log(label.length() + 1) * boost;
          `,
          "params": {
            "queryText": queryText
          }
        }
      }
    }
  }
  else if (simple_query_string) {
    query.query = {
      "script_score": {
        "query": simple_query_string,
        "script": {
          "source": `
            String label = doc['label.keyword'].size() > 0 ? doc['label.keyword'].value : '';
            double boost = doc['boost'].size() > 0 ? doc['boost'].value : 1.0;
            
            if (params.queryText.length() > 0) {
              if (label.toLowerCase().equals(params.queryText.toLowerCase())) {
                return 1000 * boost;
              } else if (label.toLowerCase().contains(params.queryText.toLowerCase())) {
                return 100 * boost;
              }
            }
            return Math.log(label.length() + 1) * boost;
          `,
          "params": {
            "queryText": queryText
          }
        }
      }
    }
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