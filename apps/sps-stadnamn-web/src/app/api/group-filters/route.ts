
//WIP
import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';
import { base64UrlToString } from '@/lib/param-utils';
import { fetchDoc } from '../_utils/actions';
import { indexToCode } from '@/lib/utils';

export async function GET(request: Request) {
  const { reservedParams, termFilters } = extractFacets(request)


  // Grunnord ids (e.g. grunnord_berg) may be sent raw or base64-encoded; accept both
  const rawGroup = reservedParams.group ?? ''
  const groupValue =
    rawGroup.startsWith('grunnord_')
      ? rawGroup
      : base64UrlToString(reservedParams.group)

    const query: any = {
    "size": 1000,
    "query": {
        "bool": {
        "filter": [{
            "term": {
            "group.id": groupValue
            }
        }, ...termFilters]
        }
    },
    "track_scores": false,
    "_source": ["attestations", "label", "altLabels", "location"],
    "sort": [
        {
        boost: {
            order: "desc",
            missing: "_last"
        }
        },
    ],
    };

    const [data, status] = await postQuery('all', query)
    const seenLocations = new Set<string>()
    const seenLabels =  new Set<string>()
    const locations: [number, number][] = []

    const outputData: {
        locations: [number, number][],
        labels: string[],
    } = {
        locations: [],
        labels: [],
    }

    data?.hits?.hits?.forEach((hit: any) => {
      // Add locations and labels if they are not already in the set
      if (hit.fields?.['location']?.[0]) {
        locations.push(hit.fields?.['location']?.[0])
      }
      if (hit.fields?.['label']?.[0]) {
        if (!seenLabels.has(hit.fields?.['label']?.[0])) {
          seenLabels.add(hit.fields?.['label']?.[0])
          outputData.labels.push(hit.fields?.['label']?.[0])
        }
      }
    })



  return Response.json(outputData, { status: status })

}