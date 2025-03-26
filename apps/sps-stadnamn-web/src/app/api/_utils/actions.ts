import { getSortArray, treeSettings } from '@/config/server-config'
import { postQuery } from './post'
import { fieldConfig } from '@/config/search-config'

const detectEnv = (retry: boolean) => {
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST
    return { endpoint, token }
}





export async function fetchDoc(params: {uuid: string | string[], dataset?: string}, retry: boolean = true) {
    'use server'
    const { uuid, dataset } = params
    const { endpoint, token } = detectEnv(retry)

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
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${token}`,
        },
        body: JSON.stringify(query)
    });


    if (!res.ok) {
        const errorResponse = await res.json();
        if (retry) {
            console.log("RETRYING WITH FALLBACK")
            return fetchDoc(params, retry = false);
        }
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


export async function fetchSOSI(sosiCode: string) {
    'use server'
    const res = await fetch("https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + sosiCode + ".json", {
        method: 'GET'
    })

    if (!res.ok) {
        // TODO: load backup json of all navneobjekttype
        return {};
    }
  const data = await res.json()
  return data

  }

  export async function fetchSOSIVocab() {
    'use server'
    const res = await fetch("https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype.json", {
        method: 'GET',
        cache: 'force-cache'
    })

    if (!res.ok) {
        // TODO: load backup json of all navneobjekttype from elasticsearch
        return {};
    }
    const data = await res.json()
    
    // Map containeditems to an object with codevalue as key
    const mappedData = data.containeditems.reduce((acc: any, item: any) => {
        acc[item.codevalue] = item;
        return acc;
    }, {});
    
    return mappedData;

  }


  export async function fetchStats() {
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
                        }
                    ]
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

    const [res, status] = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-vocab`, query)
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

export async function fetchManifest(manifestId: string) {
    'use server'
    
    try {
        // Try first manifest URL pattern
        const res = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`);
        if (res.ok) {
            return await res.json();
        }
        if (res.status !== 404) {
            throw new Error(`Failed to fetch manifest: ${res.status}`);
        }

        // Try second manifest URL pattern if first one returns 404
        const fallbackRes = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`);
        if (!fallbackRes.ok) {
            throw new Error('MANIFEST_NOT_FOUND');
        }
        return await fallbackRes.json();

    } catch (error) {
        return { error: error instanceof Error ? error.message : 'MANIFEST_NOT_FOUND' };
    }
}



export async function fetchIIIFNeighbours(order: number, partOf: string) {
  'use server'
  
  // Query for neighbors and first item
  const neighboursQuery = {
    size: 3,
    query: {
      bool: {
        must: [
          {
            term: {
              "partOf": partOf
            }
          }
        ],
        should: [
          {
            term: {
              "order": order - 1  // Get previous item
            }
          },
          {
            term: {
              "order": order + 1 // Get next item
            }
          },
          {
            term: {
              "order": 1 // Get first item
            }
          }
        ],
        minimum_should_match: 1
      }
    },
    fields: ["uuid", "order"],
    _source: false,
  }

  // Separate query to get the last item
  const lastItemQuery = {
    size: 1,
    query: {
      term: {
        "partOf": partOf
      }
    },
    sort: [
      {
        "order": "desc"
      }
    ],
    fields: ["uuid", "order"],
    _source: false,
  }

  const [neighboursData, neighboursStatus] = await postQuery('iiif_*', neighboursQuery)
  const [lastItemData, lastItemStatus] = await postQuery('iiif_*', lastItemQuery)
  
  return {
    data: {
      first: neighboursData.hits.hits.find((hit: any) => hit.fields.order == 1)?.fields.uuid,
      preceding: neighboursData.hits.hits.find((hit: any) => hit.fields.order == order - 1)?.fields.uuid,
      succeeding: neighboursData.hits.hits.find((hit: any) => hit.fields.order == order + 1)?.fields.uuid,
      last: lastItemData.hits.hits[0]?.fields.uuid
    },
    //debug: lastItemData,
    total: lastItemData.hits.hits[0]?.fields.order,
    status: neighboursStatus
  }
}