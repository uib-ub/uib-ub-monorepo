
import { extractFacets } from '../_utils/facets'
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
  linkItems: Record<string, any>[],
  audioItems: Record<string, any>[],
  datasets: string[],
  additionalLabels: string[],
  sosi: string[],
  coordinates: number[],
  fields: Record<string, any>,
};

const INNER_HIT_FIELDS = [
  "iiif",
  "location",
  "uuid",
  "label",
  "links",
  "altLabels.label",
  "attestations.label",
  "sosi",
  "content.html",
  "content.text",
  "audio.file",
  "audio.manifest",
  "area",
  "misc.Enhetsnummer",
];

const buildResultCardQuery = (id: string, useInnerHits: boolean, filterField: 'group.id' | 'uuid') => {
  const baseFields = [
    "group.label",
    "label",
    "group.id",
    "group.adm1",
    "group.adm2",
    "group.adm3",
    "location",
    "adm1",
    "adm2",
    "adm3",
    "sosi",
    "coordinateType",
    "uuid",
    // Cadastre / farm-name related fields needed for breadcrumbs.
    // NOTE: when requesting from Elasticsearch, nested fields use dots,
    // while our helper paths use double underscore.
    "cadastre.gnr",
    "cadastre.bnr",
    "misc.gardLabel",
    "within",
  ];


  const query: any = {
    "size": 1,
    "fields": baseFields,
    "query": {
      "bool": {
        "filter": [{
          "term": {
            [filterField]: id
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
  };

  if (useInnerHits) {
    query.collapse = {
      "field": "group.id",
      "inner_hits": {
        "name": "items",
        "size": 1000,
        "sort": [
          {
            "boost": {
              "order": "desc",
              "missing": "_last"
            }
          }
        ],
        "fields": INNER_HIT_FIELDS,
      }
    };
  }
  else {
    query.fields = [...baseFields, ...INNER_HIT_FIELDS]
  }

  return query;
}

export async function GET(request: Request) {
  const { reservedParams } = extractFacets(request)

  const perspective = reservedParams.perspective || 'all'
  const isSourceView = reservedParams.sourceView === 'on'
  const useInnerHits = !isSourceView
  const filterField: 'group.id' | 'uuid' = isSourceView ? 'uuid' : 'group.id'
  const itemId = reservedParams.id || ''


  let [data, status] = await postQuery(perspective, buildResultCardQuery(itemId, useInnerHits, filterField), "dfs_query_then_fetch")

  // Find group if the doc has been demoted within the group
  if (useInnerHits && data.hits?.hits.length === 0) {
    const doc = await fetchDoc({ uuid: itemId })
    if (doc) {
      [data, status] = await postQuery(perspective, buildResultCardQuery(doc._source.group.id, useInnerHits, 'group.id'), "dfs_query_then_fetch")
    }
  }

  const iiifItems: any[] = []
  const seenIiif = new Set<string>()
  const textItems: any[] = []
  const linkItems: any[] = []
  const audioItems: any[] = []
  const seenDatasets = new Set<string>()
  const datasets: string[] = []
  const seenTextIds = new Set<string>()
  const seenLinkItemKeys = new Set<string>()
  const seenAudioFiles = new Set<string>()
  const additionalLabelsByKey = new Map<string, string>()
  const sosi = new Set<string>()
  const topHit = data?.hits?.hits?.[0]
  let location = topHit?.fields?.['location']?.[0]

  const labelKey = (label: string) => label.trim().toLowerCase()

  const isAllUppercase = (label: string) => {
    // Only treat it as "all uppercase" if it actually contains letters.
    const hasLetters = /[A-Za-zÆØÅæøå]/.test(label)
    return hasLetters && label === label.toUpperCase()
  }

  const pickPreferredLabel = (a: string, b: string) => {
    const aUpper = isAllUppercase(a)
    const bUpper = isAllUppercase(b)
    if (aUpper !== bUpper) return aUpper ? b : a
    // Stable fallback (keep existing) when both have same "upper-ness"
    return a
  }

  const addAdditionalLabel = (label: string | undefined) => {
    const trimmed = (label || '').trim()
    if (!trimmed) return
    const key = labelKey(trimmed)
    const existing = additionalLabelsByKey.get(key)
    additionalLabelsByKey.set(key, existing ? pickPreferredLabel(existing, trimmed) : trimmed)
  }

  const innerHitsContainer = topHit?.inner_hits?.items?.hits
  const innerHits: any[] =
    Array.isArray(innerHitsContainer)
      ? innerHitsContainer
      : (Array.isArray((innerHitsContainer as any)?.hits) ? (innerHitsContainer as any).hits : [])

  const hits: any[] = isSourceView
    ? (topHit ? [topHit] : [])
    : innerHits

  hits.forEach((hit: any) => {
    const index_name: string = hit._index
    const dataset: string = indexToCode(index_name)[0]
    if (dataset && !seenDatasets.has(dataset)) {
      datasets.push(dataset)
      seenDatasets.add(dataset)
    }

    if (hit.fields?.['uuid'][0] == topHit?.fields?.['uuid'][0]) {
      console.error("Duplicate UUID found in group data", hit.fields?.['uuid'][0])
    }

    if (!location && hit.fields?.['location']?.[0]) {
      location = hit.fields?.['location']?.[0]
    }

    addAdditionalLabel(hit.fields?.['label']?.[0])

    hit.fields?.['attestations.label']?.forEach((label: string) => {
        addAdditionalLabel(label)
      })
    hit.fields?.['altLabels.label']?.forEach((label: string) => {
      addAdditionalLabel(label)
    })

    if (hit.fields?.['sosi']?.[0]) sosi.add(hit.fields?.['sosi']?.[0])

    const textId = hit.fields?.['misc.Enhetsnummer']?.[0]
    const rawLinks = hit.fields?.['links']?.[0]
    const links: string[] =
      Array.isArray(rawLinks)
        ? rawLinks.filter((link: unknown): link is string => typeof link === 'string' && link.length > 0)
        : typeof rawLinks === 'string' && rawLinks
          ? [rawLinks]
          : []

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
          links: rawLinks,
          dataset
        })
      }
      else if (hit.fields?.['content.text']?.[0]) {
        textItems.push({
          text: hit.fields?.['content.text']?.[0],
          uuid: hit.fields?.['uuid']?.[0],
          links: rawLinks,
          dataset
        })
      }
    }
    if (links.length > 0) {
      const uuid = hit.fields?.['uuid']?.[0]
      const linkItemKey = `${uuid || ''}|${links.join('|')}`
      if (!seenLinkItemKeys.has(linkItemKey)) {
        seenLinkItemKeys.add(linkItemKey)
        linkItems.push({
          uuid,
          links,
          dataset
        })
      }
    }
    if (hit.fields?.['audio.file']?.[0]) {
      if (!seenAudioFiles.has(hit.fields?.['audio.file']?.[0])) {
        seenAudioFiles.add(hit.fields?.['audio.file']?.[0])
        audioItems.push({
          file: hit.fields?.['audio.file']?.[0],
          uuid: hit.fields?.['uuid']?.[0],
          manifest: hit.fields?.['audio.manifest']?.[0],
          dataset
        })
      }
    }



  })

  const topFields = data?.hits?.hits?.[0]?.fields || {};

  const rawMainLabel =
    (isSourceView ? topFields["label"]?.[0] : (topFields["group.label"]?.[0] || topFields?.["label"]?.[0])) || ''

  // Ensure casing variants (e.g. "BERG" vs "Berg") are deduped and that the
  // best-cased one is preferred both in additional labels and as the main label.
  addAdditionalLabel(rawMainLabel)
  const mainLabelKey = rawMainLabel ? labelKey(rawMainLabel) : ''
  const mainLabel = (mainLabelKey ? additionalLabelsByKey.get(mainLabelKey) : undefined) || rawMainLabel

  const outputData: Partial<OutputData> = {
    id: isSourceView ? topFields["uuid"]?.[0] : topFields["group.id"]?.[0],
    label: mainLabel || undefined,
    total: data?.hits?.total?.value,
    fields: topFields,
  };

  // Remove main label from additional labels (case-insensitive).
  if (outputData.label) additionalLabelsByKey.delete(labelKey(outputData.label))

  outputData.fields = {
    ...outputData.fields,
    // Expose a synthetic cadastre__gnr / cadastre__bnr so helpers that
    // expect the double-underscore convention keep working.
    ...(topFields["cadastre.gnr"] ? { "cadastre__gnr": topFields["cadastre.gnr"] } : {}),
    ...(topFields["cadastre.bnr"] ? { "cadastre__bnr": topFields["cadastre.bnr"] } : {}),
    ...(location ? { location } : {}),
    ...(sosi.size > 0 ? { sosi: Array.from(sosi) } : {}),
  }



  if (iiifItems.length > 0) outputData.iiifItems = iiifItems;
  if (textItems.length > 0) outputData.textItems = textItems;
  if (linkItems.length > 0) outputData.linkItems = linkItems;
  if (audioItems.length > 0) outputData.audioItems = audioItems;
  if (datasets.length > 0) outputData.datasets = datasets;
  if (additionalLabelsByKey.size > 0) outputData.additionalLabels = Array.from(additionalLabelsByKey.values());


  return Response.json(outputData, { status: status })

}