//export const runtime = 'edge'
import { extractFacets } from "../_utils/facets"
import { postQuery } from "../_utils/post"
import { getQueryString } from "../_utils/query-string"

export async function GET(request: Request) {
    const {termFilters, reservedParams} = extractFacets(request)
    const dataset = reservedParams.dataset || 'all'
    const { simple_query_string } = getQueryString(reservedParams)
    
    const query: Record<string,any> = {
        "size": 0,
        "track_scores": true,
        "aggs": {
            "by_wiki": {
                "terms": {
                    "field": "wikiAdm",
                    "size": 50
                },
                "aggs": {
                    "adm1": {
                        "terms": {
                            "field": "adm1.keyword",
                            "size": 100,
                            "order": { "_count": "desc" }  // Sort by frequency
                        },
                        "aggs": {
                            "top_hit": {
                                "top_hits": {
                                    "size": 2,
                                    "_source": ["adm1", "wikiAdm"]
                                }
                            },
                            "adm2": {
                                "terms": {
                                    "field": "adm2.keyword",
                                    "size": 100,
                                    "order": { "_count": "desc" }  // Sort by frequency
                                },
                                "aggs": {
                                    "top_hit": {
                                        "top_hits": {
                                            "size": 2,
                                            "_source": ["adm2", "wikiAdm"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add term query if it exists
    if (reservedParams.facetQuery) {
        const termQueryPart = {
            "query_string": {
                "query": reservedParams.facetQuery + "*",
                "allow_leading_wildcard": true,
                "default_operator": "OR",
                "fields": ["adm1^3", "adm2^2", "adm3^1", "wikiAdm"]
            }
        }

        if (simple_query_string && termFilters.length) {
            query.query = {
                "bool": {
                    "must": [
                        simple_query_string,
                        termQueryPart
                    ],
                    "filter": termFilters
                }
            }
        } else if (simple_query_string) {
            query.query = {
                "bool": {
                    "must": [
                        simple_query_string,
                        termQueryPart
                    ]
                }
            }
        } else if (termFilters.length) {
            query.query = {
                "bool": {
                    "must": termQueryPart,
                    "filter": termFilters
                }
            }
        } else {
            query.query = termQueryPart
        }
    } else {
        // Original query logic without term query
        if (simple_query_string && termFilters.length) {
            query.query = {
                "bool": {
                    "must": simple_query_string,              
                    "filter": termFilters
                }
            }
        } else if (simple_query_string) {
            query.query = simple_query_string
        } else if (termFilters.length) {
            query.query = {
                "bool": {
                    "filter": termFilters
                }
            }
        }
    }


    const [data, status] = await postQuery(dataset, query, "dfs_query_then_fetch")
    return Response.json(data, {status: status})
}