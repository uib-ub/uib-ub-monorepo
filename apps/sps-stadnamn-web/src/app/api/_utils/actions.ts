import { contentSettings } from '@/config/server-config'
import { postQuery } from './post'

const detectEnv = (retry: boolean) => {
    const endpoint = (process.env.SN_ENV == 'prod' ? retry : !retry) ? process.env.ES_ENDPOINT : process.env.ES_ENDPOINT_TEST
    const token = endpoint == process.env.ES_ENDPOINT ? process.env.ES_TOKEN : process.env.ES_TOKEN_TEST
    return { endpoint, token }
}


export async function fetchDoc(params: any, retry: boolean = true) {
    'use server'
    const { endpoint, token } = detectEnv(retry)

    let res
    // Post a search query for the document
    const query = {
        query: {
            terms: {
                "uuid": [params.uuid]
            }
        }
    }


    res = await fetch(`${endpoint}search-stadnamn-${process.env.SN_ENV}-*/_search`, {
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

  return data.hits.hits[0]

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
                        {
                            "exists": {
                                "field": "snid"
                            }
                        }
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

    const res = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-vocab`, query)

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

    const res = await postQuery('search', query)

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
    return await postQuery(dataset, query)
    
}



export async function fetchCadastralView (dataset: string, groupBy: string | undefined, parents: Record<string, string>) {
    'use server'
    const filters = parents ? Object.entries(parents).filter(([key, value]) => ["adm1", "adm2", "adm3"].includes(key)).map(([key, value]) => ({ term: { [key + ".keyword"]: value } })) : [];
    const query = {
        size: groupBy ? 0 : 1000,
        query: {

            bool: {
                must: [
                    { match: contentSettings[dataset].tree?.filter || { sosi: 'gard' } }
                ],
                filter: filters
            }
        },
        fields: ["label", "uuid", (contentSettings[dataset].tree?.subunit || "cadastre.gnr"), "location"],
        ...groupBy ? {
            aggs: {
                adm: {
                    terms: {
                        field: groupBy + ".keyword",
                        size: 500,
                    },
                    aggs: {
                        knr: {
                            terms: {
                                field: contentSettings[dataset].tree?.knr || "knr.keyword",
                                size: 1,
                            }
                        }

                    }
                }
            }
        } : {
            sort: contentSettings[dataset].tree?.sort ? 
                contentSettings[dataset].tree?.sort?.map((field: string) => {
                    return {[field]: {order: "asc"}}
                })
                


            : [{ "cadastre.gnr": { order: "asc", nested: { path: "cadastre" } } }]

            
        },
        _source: false
    };

    //console.log("QUERY", JSON.stringify(query, null, 2))

    return await postQuery(dataset, query)


    }
