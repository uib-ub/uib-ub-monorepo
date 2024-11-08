import { useParams, useSearchParams } from 'next/navigation'
import { resultRenderers } from '@/config/result-renderers-map-search'

export function useQueryWithout(omit : string[]) {
    const params = useSearchParams()
    const paramsArray = Array.from(params.entries());
    // IF in omit or first character is underscore
    return  paramsArray.filter(([key]) => !omit.includes(key) && key[0] !== '_');

}

export function useQueryStringWithout(omit : string[]) {
    return new URLSearchParams(useQueryWithout(omit)).toString();
}

export function useDataset() {
    const searchParams = useSearchParams()
    return searchParams?.get('dataset') || 'search'
}


/**
 * 
 * @returns searchQuery: URLSearchParams object with the search query
 * @returns searchQueryString: searchQuery as a string
 * @returns searchFilterParamsString: search params except dataset

 */
export function useSearchQuery() {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    // Return params matching certain criteria
    // - q, size, page, starts with "rawData"
    const fields = ['q', 'adm']

    // Add dataset specific fields
    const renderer = resultRenderers[dataset]
    if (renderer?.fields) {
        fields.push(...renderer.fields)
    }

    
    const searchQuery = new URLSearchParams()


    fields.forEach(field => {
        const values = searchParams.getAll(field)
        values.forEach(value => {
            searchQuery.append(field, value)
        })
    })

    searchParams.forEach((value, key) => {
        if (key.startsWith('rawData')) {
            searchQuery.append(key, value)
        }
    })

    const searchFilterParamsString = searchQuery.toString()
    // Params that don't require the results section to be shown
    if (searchParams.get('dataset')) {
        searchQuery.set('dataset', dataset)
    }
    const field = searchParams.get('field')
    if (field) {
        searchQuery.set('field', field)
    }

    return {searchQueryString: searchQuery.toString(), searchQuery, searchFilterParamsString}
}