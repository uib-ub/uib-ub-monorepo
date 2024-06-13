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

// Fetch children aggregated by dataset and administrative units. Used in place name ID info page.
export async function fetchChildrenGrouped(uuids: string[], retry: boolean = true) {
    'use server'
    const { endpoint, token } = detectEnv(retry)

    const query = {
        query: {
            terms: {
                "uuid": uuids
            }
        },
        aggs: {
            dataset: {
                terms: {
                    field: "_index",
                    size: 100
                },
                aggs: {
                    top_docs: {
                        top_hits: {}
                    }
                }
            }
        }
    }

    const res = await fetch(`${endpoint}stadnamn-${process.env.SN_ENV}-*/_search`, {
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
            return fetchChildrenGrouped(uuids, retry = false);
        }
        return {error: errorResponse.error.type.toUpperCase(), status: errorResponse.status};
    }
    const data = await res.json()
    return data.aggregations.dataset.buckets

  }



  export async function fetchStats() {
    'use server'
    const query = {
        "size": 0,
        "aggs": {
            "search_dataset": {
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
                }
            },
            "other_datasets": {
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
                }
            }
        }
    }

    const res = await postQuery('*', query)

    return res
}