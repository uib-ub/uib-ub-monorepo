import { useSearchParams } from 'next/navigation'
import { fieldConfig } from '@/config/search-config';

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
    const fields = ['q', ...Object.keys(fieldConfig[dataset])]
    const facetFilters: [string, string][] = []
    const searchQuery = new URLSearchParams()
    const mode = searchParams.get('mode')
    
    if (mode == 'tree') {
        searchQuery.append('sosi', 'gard')
        const adm = searchParams.get('adm')
        if (adm) {
            searchQuery.append('adm', adm)
        }
    }
    else {
        fields.forEach(field => {
            const values = searchParams.getAll(field)
            values.forEach(value => {
                searchQuery.append(field, value)
                if (field != 'q') {
                    facetFilters.push([field, value])
                }
            })
        })
    
        searchParams.forEach((value, key) => {
            if (!fields.includes(key) && (key.startsWith('rawData') || key.startsWith('misc'))) {
                searchQuery.append(key, value)
                facetFilters.push([key, value])
            }
        })

    }


    

    const searchFilterParamsString = searchQuery.toString()
    // Params that don't require the results section to be shown
    if (searchParams.get('dataset')) {
        searchQuery.set('dataset', dataset)
    }
    const field = searchParams.get('field')
    if (field && mode != 'tree') {
        searchQuery.set('field', field)
    }

    const removeFilterParams = (key: string) => {
        const outputUrl = new URLSearchParams(searchQuery)
        outputUrl.delete(key)
        return outputUrl.toString()
    }


    return {searchQueryString: searchQuery.toString(), searchQuery, searchFilterParamsString, facetFilters, removeFilterParams }
}