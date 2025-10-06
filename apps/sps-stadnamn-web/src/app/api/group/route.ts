//export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)

  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;
  const { simple_query_string } = getQueryString(reservedParams)

  let sortArray: (string | object)[] = []
    
    // Existing sorting logic

  if (!sortArray.length) {
    sortArray = getSortArray(perspective)
  }

  const from = reservedParams.from || 0;
  const isFirstPage = from === 0;
    
  const query: Record<string,any> = {
    "size": reservedParams.size || 20,
    "from": from,
    "track_scores": true,
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },
      }
    },
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
    "_source": ["uuid", "label", "attestations", "sosi", "content", "iiif", "recordings", "location"]
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

  
  
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")


  const topDoc = data.hits?.hits?.[0]?._source
  const group = topDoc?.group
  const { adm1, adm2, adm3 } = group || {}
  const label = topDoc?.label
  


  //console.log('GROUP DATA', {adm1, adm2, adm3, label})

  type OutputData = {
    label: any;
    adm1?: any;
    adm2?: any;
    adm3?: any;
    viewport?: any;
    total?: number;
    sources: {uuid: string, label: string, sosi: string, location?: any}[];
  };

  const outputData: OutputData = {
    label,
    ...adm1 ? {adm1} : {},
    ...adm2 ? {adm2} : {},
    ...adm3 ? {adm3} : {},
    "sources": data.hits?.hits.map((hit: any) => {
      return { 
              dataset: hit._index.split('-')[2],
              ...hit._source
                }
    }) || []
  }
              
              
 

  if (data.aggregations?.viewport?.bounds) {
    outputData['viewport'] = data.aggregations.viewport.bounds
  }

  outputData['total'] = data.hits?.total?.value || 0







  return Response.json(outputData, {status: status})
  
}