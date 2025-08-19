import { getSortArray, treeSettings } from '@/config/server-config'
import { postQuery } from './post'
import { fieldConfig } from '@/config/search-config'

export async function fetchDoc(params: {uuid: string | string[], dataset?: string}) {
    'use server'
    const { uuid, dataset } = params
    // TODO: use the same variable name in prod and test
    const endpoint = process.env.STADNAMN_ES_ENDPOINT
    const token = process.env.STADNAMN_ES_TOKEN

    // Post a search query for the document
    const query = {
        query: {
            bool: {
                should: [
                    Array.isArray(uuid) ? { terms: { uuid: uuid } } : { term: { uuid: uuid } },
                    Array.isArray(uuid) ? { terms: { redirects: uuid } } : { term: { redirects: uuid } }
                ]
            }
        }
    }

    const res = await fetch(`${endpoint}search-stadnamn-${process.env.SN_ENV}-${dataset ? dataset : '*'}/_search`, {
        cache: 'force-cache',
        next: {
            tags: ['all']
        },
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(query)
    });


    if (!res.ok) {
        const errorResponse = await res.json();
        if (errorResponse.error) {
            return {error: errorResponse.error.type.toUpperCase(), status: errorResponse.status};
        }
        if (errorResponse.found == false) {
            return {error: "DOCUMENT_NOT_FOUND", status: "404"}
        }
    }
  const data = await res.json()
  //console.log(data)

  return Array.isArray(uuid) ? data.hits.hits : data.hits.hits[0]

  }

  export async function fetchSOSI(params: {sosiCode: string}) {
    'use server'
    const { sosiCode } = params

    const query = {
        query: {
            term: {
                "sosiCode": sosiCode
            }
        }
    }

    const [res, status] = await postQuery('vocab_sosi', query)
    if (status !== 200) {
        return { error: "Failed to fetch sosi", status: status }
    }

    return res.hits.hits[0]  // Return the first match
}

  export async function fetchVocab() {
    'use server'
    const query = {
        query: {
            match_all: {}
        },
        _source: true,
        size: 10000 // Adjust size as needed
    }

    const [res, status] = await postQuery('vocab_*', query)
    if (status !== 200) {
        return { error: "Failed to fetch vocab", status: status }
    }

    const coordinateVocab: Record<string, any> = {}
    const sosiVocab: Record<string, any> = {}
    res.hits.hits.forEach((hit: any) => {
        if (hit._source.sosiCode) {
            sosiVocab[hit._source.sosiCode] = hit._source
        }
        else {
            coordinateVocab[hit._source.uuid] = hit._source
        }
    })

    return {coordinateVocab, sosiVocab}
}



  export async function fetchStats(dataset?: string) {
    'use server'
    const query = {
    "size": 0,
    "aggs": {
        "snid": {
            "filter": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "_index": `search-stadnamn-${process.env.SN_ENV}-search`
                            }
                        },
                    ]
                }
            },
            "aggs": {
                "indices": {
                    "terms": {
                        "field": "_index"
                    }
                }
            }
        },
        "datasets": {
            "filter": {
                "bool": {
                    "must_not": [
                        {
                            "term": {
                                "_index": `search-stadnamn-${process.env.SN_ENV}-search`
                            }
                        },           
                    ],
                    ...(dataset ? {
                        "must": [
                            {
                                "term": {
                                    "_index": `search-stadnamn-${process.env.SN_ENV}-${dataset}`
                                }
                            }
                        ]
                    } : {})
                }
            },
            "aggs": {
                "indices": {
                    "terms": {
                        "field": "_index",
                        "size": 100
                    }
                }
            }
        }
    }
}

    const [res, status] = await postQuery(`search,search-stadnamn-${process.env.SN_ENV}-all`, query)
    if (status != 200) {
        return {error: "Failed to fetch stats", status: status}
    }



    //  Split the datasets into datasets amd subdatasets (the latter contain underscores)
    const datasets = res.aggregations.datasets.indices.buckets.reduce((acc: any, bucket: any) => {
        if (!bucket.key.includes('_')) {
            const [ code, timestamp] = bucket.key.split('-').slice(2)
            acc[code] = {doc_count: bucket.doc_count, timestamp: timestamp}
        }
        return acc
    }, {})

    const subdatasets = res.aggregations.datasets.indices.buckets.reduce((acc: any, bucket: any) => {
        if (bucket.key.includes('_')) {
            acc[bucket.key] = bucket.doc_count
        }
        return acc
    }, {})
    
       
    const snidCount = res.aggregations.snid.doc_count

    // Sum of documents in datasets
    const datasetDocs = Object.values(datasets).reduce((acc: number, dataset: any) => acc + dataset.doc_count, 0)
    const datasetCount = Object.keys(datasets).length



    return {datasetDocs, datasetCount, snidCount, datasets, subdatasets}
}


export async function fetchSNID(snid: string) {
    'use server'
    const query = {
        query: {
            term: {
                "snid.keyword": snid,
            }
        },
        fields: ["uuid"],
        _source: false
    }

    const [res, status] = await postQuery('search', query)
    if (status != 200) {
        return {error: "Failed to fetch SNID", status: status}
    }

    return res.hits?.hits?.[0] || res

}


// Fetch snid when you have the uuid of a child
export async function fetchSNIDParent(uuid: string) {
    'use server'
    const query = {
        query: {
            term: {
                "children.keyword": uuid,
            }
        },
        fields: ["uuid", "snid", "label", "datasets"],
        _source: false
    }

    const [res, status] = await postQuery('search', query)
    if (status != 200) {
        return {error: "Failed to fetch parent", status: status}
    }

    return res.hits?.hits?.[0] || res

}


// Fetch children of a document in the same index (documents that have the uuid as the value in "within" field)
export async function fetchCadastralSubunits(dataset: string, uuid: string, fields: string[], sortFields: string[]) {
    'use server'
    const query = {
        size: 1000,
        query: {
            term: {
                "within.keyword": uuid
            }
        },
        fields: fields,    
        sort: sortFields.map((field: string) => {
            if (field.startsWith("cadastre.")) {
                return {
                    [field]: {
                        order: "asc",
                        nested: {
                            path: field.split('.')[0] // Assuming the field is in the format "cadastre.bnr"
                        }
                    }
                };
            } else {
                return {[field]: "asc"};
            }
        }),
        _source: false

    }
    const [res, status] = await postQuery(dataset, query)
    if (status != 200) {
        return {error: "Failed to fetch children", status: status}
    }
    return res
    
}

export async function fetchChildren(params: {
    uuids?: string[],
    mode?: string,
    within?: string,
    dataset?: string
}): Promise<[any, number]> {
    'use server'
    const { uuids, mode, within, dataset } = params

    if (!mode) {
        return [{ error: "Mode is required" }, 400]
    }

    if (!uuids && !(dataset && within)) {
        return [{ error: "Either uuids or both dataset and within are required" }, 400]
    }

    const geo = mode == 'map' && {
        aggs: {
            viewport: {
                geo_bounds: {
                    field: "location",
                    wrap_longitude: true
                }
            }
        }
    }

    const query = {
        size: 1000,
        _source: false,
        fields: ["uuid","label", "attestations.label", "altLabels", "sosi", "location",
                ...dataset && treeSettings[dataset] ? Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => key) : [],
                ...dataset && treeSettings[dataset] ? [treeSettings[dataset].leaf.replace("__", ".")] : [],
                ...dataset && treeSettings[dataset] ? [treeSettings[dataset].subunit.replace("__", ".")] : [],

        ],
        query: {
            ...(uuids ? {
                terms: {
                    "uuid": uuids
                }
            } : {
                term: {
                    "within.keyword": within
                }
            })
        },
        ...(dataset ? {sort: treeSettings[dataset]?.sort?.map(field => field.includes("__") ? {[field.replace("__", ".")]: {nested: {path: field.split("__")[0]}}} : field) || getSortArray(dataset)} : {}),
        ...geo || {}
    }

    const [res, status] = await postQuery(dataset || `*,-search-stadnamn-${process.env.SN_ENV}-search`, query)
    return [res, status] as [any, number]
}
