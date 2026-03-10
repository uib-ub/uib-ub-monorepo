
import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { base64UrlToString } from '@/lib/param-utils';
import { fetchDoc } from '../_utils/actions';
import { indexToCode } from '@/lib/utils';


type OutputData = {
  id: string,
  label: string,
  total: number,
  iiifItems: Record<string, any>[],
  textItems: Record<string, any>[],
  audioItems: Record<string, any>[],
  datasets: string[],
  labels: string[],
  sosi: string[],
  coordinates: number[],
  
};

const buildGroupQuery = (groupValue: string) => {
  return ({
    "size": 1,
    "fields": [
      "group.label",
    ],
    "collapse": {
      "field": "group.id",
      "inner_hits": {
        "name": "items",
        "size": 1000,
        "fields": [
          "iiif",
          "location",
          "uuid",
          "label",
          "links",
          "altLabels.label",
          "sosi",
          "content.html",
          "content.text",
          "audio.file",
          "audio.manifest",
          "area",
          "misc.Enhetsnummer",
        ]
      }
    },
    "query": {
      "bool": {
        "filter": [{
          "term": {
              "group.id": groupValue
          }
        }]
      }
    },
    "track_scores": false,
    "_source": false,
    "sort": [
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],

    //"track_total_hits": false,
  })
}

export async function GET(request: Request) {
  const { reservedParams } = extractFacets(request)

  const perspective = reservedParams.perspective || 'all'

  // Grunnord ids (e.g. grunnord_berg) may be sent raw or base64-encoded; accept both
  const rawGroup = reservedParams.group ?? ''
  const groupValue =
    rawGroup.startsWith('grunnord_')
      ? rawGroup
      : base64UrlToString(reservedParams.group)


  let [data, status] = await postQuery(perspective, buildGroupQuery(groupValue), "dfs_query_then_fetch")

  // Find group if the doc has been demoted within the group
  if (data.hits?.hits.length === 0) {
    const doc = await fetchDoc({ uuid: groupValue })
    if (doc) {
      [data, status] = await postQuery(perspective, buildGroupQuery(doc._source.group.id), "dfs_query_then_fetch")
    }
  }

  const iiifItems: any[] = []
  const seenIiif = new Set<string>()
  const textItems: any[] = []
  const audioItems: any[] = []
  const datasets: Set<string> = new Set()
  const seenTextIds = new Set<string>()
  const labels = new Set<string>()
  const sosi = new Set<string>()
  let coordinates: number[] | null = null

  const innerHits =
    data?.hits?.hits?.[0]?.inner_hits?.items?.hits &&
    Array.isArray((data.hits.hits[0] as any).inner_hits.items.hits)
      ? (data.hits.hits[0] as any).inner_hits.items.hits
      : (data?.hits?.hits?.[0]?.inner_hits?.items?.hits as any)?.hits ?? []

  innerHits?.forEach((hit: any) => {
    const index_name: string = hit._index
    const dataset: string = indexToCode(index_name)[0]
    if (dataset) datasets.add(dataset)
    
    if (!coordinates && Array.isArray(hit.fields?.['location'])) {
      coordinates = hit.fields?.['location']?.[0]?.coordinates
    }

    if (hit.fields?.['label']?.[0]) labels.add(hit.fields?.['label']?.[0])
    if (hit.fields?.['altLabels.label']?.[0]) labels.add(hit.fields?.['altLabels.label']?.[0])
    if (hit.fields?.['sosi']?.[0]) sosi.add(hit.fields?.['sosi']?.[0])

    const textId = hit.fields?.['misc.Enhetsnummer']?.[0]

    if (hit.fields?.['iiif']?.[0] && !seenIiif.has(hit.fields?.['iiif']?.[0])) {
      seenIiif.add(hit.fields?.['iiif']?.[0])
      iiifItems.push({
        iiif: hit.fields?.['iiif']?.[0],
        dataset
      })
    }
    if (!textId || !seenTextIds.has(textId)) {
      if (hit.fields?.['content.html']?.[0]) {
        seenTextIds.add(textId)
        textItems.push({
          text: hit.fields?.['content.html']?.[0],
          uuid: hit.fields?.['uuid']?.[0],
          links: hit.fields?.['links']?.[0],
          dataset
        })
      }
      else if (hit.fields?.['content.text']?.[0]) {
        textItems.push({
          text: hit.fields?.['content.text']?.[0],
          uuid: hit.fields?.['uuid']?.[0],
          links: hit.fields?.['links']?.[0],
          dataset
        })
      }
    }
    if (hit.fields?.['audio.file']?.[0]) {
      audioItems.push({
        file: hit.fields?.['audio.file']?.[0],
        uuid: hit.fields?.['uuid']?.[0],
        manifest: hit.fields?.['audio.manifest']?.[0],
        dataset
      })
    }



  })

  const outputData: Partial<OutputData> = {
    "id": data?.hits?.hits?.[0]?.fields?.['group.id']?.[0],
    "label": data?.hits?.hits?.[0]?.fields?.['group.label']?.[0],
    "total": data?.hits?.total?.value,
  };
  if (iiifItems.length > 0) outputData.iiifItems = iiifItems;
  if (textItems.length > 0) outputData.textItems = textItems;
  if (audioItems.length > 0) outputData.audioItems = audioItems;
  if (datasets.size > 0) outputData.datasets = Array.from(datasets);
  if (labels.size > 0) outputData.labels = Array.from(labels);
  if (sosi.size > 0) outputData.sosi = Array.from(sosi);
  if (coordinates) outputData.coordinates = coordinates;





  return Response.json(outputData, { status: status })

}