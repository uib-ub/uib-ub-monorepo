import { getSortArray, treeSettings } from '@/config/server-config'
import { postQuery } from './post'
import { fieldConfig } from '@/config/search-config'
import { datasetTitles } from '@/config/metadata-config'

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

  export async function fetchIIFDocByIndex(params: {partOf: string, order: string}) {
    'use server'
    const { partOf, order } = params
    const query = {
        size: 1,
        fields: ['uuid'],
        _source: false,
        query: {
            bool: {
                must: [
                    { term: { partOf: partOf } },
                    { term: { order: parseInt(order) } }
                ]
            }
        }
    }
    const [res, status] = await postQuery("iiif_*", query)
    if (status !== 200) {
        return { error: "Failed to fetch IIIF document", status: status }
    }

    return res.hits.hits[0]
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

