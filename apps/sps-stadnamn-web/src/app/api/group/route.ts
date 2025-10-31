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

  const perspective = reservedParams.perspective || 'all'

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
    "sort": [
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],
    "track_total_hits": false,
    "_source": ["uuid", "label", "attestations", "year", "boost", "sosi", "content", "iiif", "recordings", "location", "boost", "placeScore", "group", "links", "coordinateType", "area", "misc.Enhetsnummer", "ssr"],
  }

/* Todo - add option to filter group? - no, this can be done in the table view.
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
      textId: hit._source.misc?.Enhetsnummer,
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
      ssr: hit._source.ssr,
      boost: hit._source.boost,
    })

    
  })




  const outputData: OutputData = {
    ...topDoc,
    sources,
    //viewport: data.aggregations?.viewport?.bounds,
  }
              

  
  return Response.json(outputData, {status: status})
  
}