//export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { base64UrlToString } from '@/lib/param-utils';

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)

  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;

  const groupValue = base64UrlToString(reservedParams.group)
    
  const query: Record<string,any> = {
    "size": 1000,
    "fields": ["group.adm1", "group.adm2", "uuid", "boost", "label", "location"],
    "query": groupValue?.startsWith('grunnord_') && reservedParams.q?.length
      ? simple_query_string
      : {
          "term": {
            "group.id": groupValue
          }
        },
    "track_scores": false,
    "track_total_hits": false,
    "_source": ["uuid", "label", "attestations", "sosi", "content", "iiif", "recordings", "location", "boost", "placeScore", "group", "links"],
    /*
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },
      }
    }
    */
  }


/* Todo - add option to filter group? - no, this can be done in the table view
  if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }
    */


  
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")

  const sources: any[] = []
  const topDoc = {boost: -1, 
                placeScore: -1, 
                group: data.hits?.hits[0]?._source?.group, 
                fields: data.hits?.hits[0]?.fields, 
                _index: data.hits?.hits[0]?._index}

  
  data?.hits?.hits.forEach((hit: any) => {
    const boost = hit._source.boost || 0
    const placeScore = hit._source.placeScore || 0
    
    if ( boost > topDoc.boost) {
      topDoc['boost'] = boost
    }
    if ( placeScore > topDoc.placeScore) {
      topDoc['placeScore'] = placeScore
    }

    sources.push({
      dataset: hit._index.split('-')[2],
      uuid: hit._source.uuid,
      label: hit._source.label,
      attestations: hit._source.attestations,
      sosi: hit._source.sosi,
      content: hit._source.content,
      iiif: hit._source.iiif,
      recordings: hit._source.recordings,
      location: hit._source.location,
    })

    
  })


  type OutputData = {
    boost: number,
    placeScore: number,
    sources: any[]
    //viewport: any
  

  };

  const outputData: OutputData = {
    ...topDoc,
    sources,
    //viewport: data.aggregations?.viewport?.bounds,
  }
              

  
  return Response.json(outputData, {status: status})
  
}