import { postQuery } from './fetch'

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


    res = await fetch(`${endpoint}stadnamn-${process.env.SN_ENV}-*/_search`, {
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
                                "_index": `stadnamn-${process.env.SN_ENV}-search`
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
                                "_index": `stadnamn-${process.env.SN_ENV}-vocab`
                            }
                        },
                        {
                            "term": {
                                "_index": `stadnamn-${process.env.SN_ENV}-search`
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

    const res = await postQuery('*', query)

    //  Split the datasets into datasets amd subdatasets (the latter contain underscores)
    const datasets = res.aggregations.datasets.indices.buckets.reduce((acc: any, bucket: any) => {
        if (!bucket.key.includes('_')) {
            const [ code, timestamp] = bucket.key.split('-').slice(1)
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
    console.log

    const res = await postQuery('search', query)
    console.log("RES", res.hits?.hits?.[0])
    return res.hits?.hits?.[0] || res

}