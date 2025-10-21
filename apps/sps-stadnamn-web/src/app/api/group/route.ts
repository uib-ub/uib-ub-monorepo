//export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { base64UrlToString } from '@/lib/param-utils';


  type OutputData = {
    boost: number,
    placeScore: number,
    sources: Record<string, any>[],

  };

export async function GET(request: Request) {
  const {termFilters, reservedParams} = extractFacets(request)
  const { simple_query_string } = getQueryString(reservedParams)
  console.log("USING GET (SERVER)")

  const perspective = reservedParams.perspective || 'all'  // == 'search' ? '*' : reservedParams.dataset;

  const groupValue = base64UrlToString(reservedParams.group)
    
  const query: Record<string,any> = {
    "size": 1000,
    "fields": ["group.adm1", "group.adm2", "group.id", "uuid", "boost", "label", "location"],
    "query": groupValue?.startsWith('grunnord_') && reservedParams.q?.length
      ? simple_query_string
      : {
          "term": {
            "group.id": groupValue
          }
        },
    "track_scores": false,
    "track_total_hits": false,
    "_source": ["uuid", "label", "attestations", "year", "sosi", "content", "iiif", "recordings", "location", "boost", "placeScore", "group", "links", "coordinateType", "area", "rawData.Enhetsnummer"],
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
    sources.push({
      dataset: hit._index.split('-')[2],
      uuid: hit._source.uuid,
      label: hit._source.label,
      textId: hit._source.rawData?.Enhetsnummer,
      attestations: hit._source.attestations,
      year: hit._source.year,
      sosi: hit._source.sosi,
      content: hit._source.content,
      iiif: hit._source.iiif,
      recordings: hit._source.recordings,
      location: hit._source.location,
      coordinateType: hit._source.coordinateType,
      area: hit._source.area,
      links: hit._source.links,
      link: hit._source.link,
    })

    
  })




  const outputData: OutputData = {
    ...topDoc,
    sources,
    //viewport: data.aggregations?.viewport?.bounds,
  }
              

  
  return Response.json(outputData, {status: status})
  
}


export async function POST(request: Request) {
  const perspective = 'all'
  const { debugChildren, groupId } = await request.json()
  console.log("GROUP IN POST HANDLER", groupId)
  const query: Record<string,any> = {
    "size": 1000,
    "fields": ["group.adm1", "group.adm2", "group.id", "uuid", "boost", "label", "location"],
        "query": {
      "bool": {
        "should": [
          {
            "bool": {
              "must": [
                { "term": { "_index": `search-stadnamn-${process.env.SN_ENV}-group_debug` } },
                { "term": { "group.id": groupId } }
              ]
            }
          },
          {
            "terms": {
              "uuid": debugChildren
            }
          }
        ],
        "minimum_should_match": 1
      }
    },
    "sort": [
      {"misc.length": {order: "desc", unmapped_type: "long", missing: "_last"}},
    ],
    "track_scores": false,
    "track_total_hits": false,
    "_source":["uuid", "label", "attestations", "year", "sosi", "content", "iiif", "recordings", "location", "boost", "placeScore", "group", "links", "coordinateType", "area", "rawData.Enhetsnummer", "misc"]

  }
  
  const [data, status] = await postQuery(perspective, query, "dfs_query_then_fetch")

  console.log("GROUP POST DATA", data.hits?.hits.length)

  const sources: any[] = []
  const topDoc = {boost: -1, 
                placeScore: -1, 
                group: data.hits?.hits[0]?._source?.group, 
                fields: data.hits?.hits[0]?.fields, 
                _index: data.hits?.hits[0]?._index,
                 misc: data.hits?.hits[0]?._source?.misc
              }
               

  
  data?.hits?.hits.forEach((hit: any) => {
    sources.push({
      dataset: hit._index.split('-')[2],
      uuid: hit._source.uuid,
      label: hit._source.label,
      textId: hit._source.rawData?.Enhetsnummer,
      attestations: hit._source.attestations,
      year: hit._source.year,
      sosi: hit._source.sosi,
      content: hit._source.content,
      iiif: hit._source.iiif,
      recordings: hit._source.recordings,
      location: hit._source.location,
      coordinateType: hit._source.coordinateType,
      area: hit._source.area,
      links: hit._source.links,
      link: hit._source.link,
    })

  })

  const outputData: OutputData = {
    ...topDoc,
    sources,
  }


  return Response.json(outputData, {status: status})
  
}