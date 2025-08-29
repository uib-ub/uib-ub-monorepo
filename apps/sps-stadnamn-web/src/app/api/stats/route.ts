//export const runtime = 'edge'
import { datasetTitles } from '@/config/metadata-config';
import { postQuery } from '../_utils/post';
import { fetchIIIFStats } from '../iiif/iiif-stats';

export async function GET() {
    const searchableDatasets = Object.keys(datasetTitles).filter(d => !d.startsWith("_core"))
    const baseWordDatasets = searchableDatasets.filter(d => d.endsWith("_g"))
    const query = {
        "size": 0,
        "track_total_hits": false,
        "aggs": {
            "datasets": {
                "terms": {
                    "field": "_index",
                    "size": 100
                },
            },
            "groups": {
                "filter": {
                    "bool": {
                        "must": [
                            { "exists": { "field": "group.id" } }
                        ],
                        "must_not": [
                            { "terms": { "_index": baseWordDatasets.map((dataset) => `search-stadnamn-${process.env.SN_ENV}-${dataset}`) } }
                        ]
                    }
                },
                "aggs": {
                    "unique_group_ids": {
                        "cardinality": {
                            "field": "group.id"
                        }
                    }
                }
            }
        }
    }

    // Fetch stats and IIIF stats in parallel
    const [[res, status], iiifStats] = await Promise.all([
        postQuery("all", query),
        fetchIIIFStats()
    ]);

    if (status != 200) {
        return {error: "Failed to fetch stats", status: status}
    }

    // Split the datasets into datasets and subdatasets (the latter contain underscores)
    const buckets = res.aggregations.datasets?.buckets || [];
    const datasets = buckets.reduce((acc: any, bucket: any) => {
        if (!bucket.key.includes('_')) {
            const [ code, timestamp] = bucket.key.split('-').slice(2)
            acc[code] = {doc_count: bucket.doc_count, timestamp: timestamp}
        }
        return acc
    }, {})

    const subdatasets = buckets.reduce((acc: any, bucket: any) => {
        if (bucket.key.includes('_')) {
            acc[bucket.key] = bucket.doc_count
        }
        return acc
    }, {})

    const groupCount = res.aggregations.groups.unique_group_ids.value

    return Response.json({groupCount, datasets, subdatasets, iiifStats})
}