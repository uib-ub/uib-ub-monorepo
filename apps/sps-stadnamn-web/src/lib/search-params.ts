import { useSearchParams } from 'next/navigation'
import { fieldConfig } from '@/config/search-config';
import { parseAsInteger, useQueryState } from 'nuqs';
import { contentSettings } from '@/config/server-config';

export function useQueryWithout(omit : string[]) {
    const params = useSearchParams()
    const paramsArray = Array.from(params.entries());
    // IF in omit or first character is underscore
    return  paramsArray.filter(([key]) => !omit.includes(key) && key[0] !== '_');

}

export function useQueryStringWithout(omit : string[]) {
    return new URLSearchParams(useQueryWithout(omit)).toString();
}

export function usePerspective() {
    const searchParams = useSearchParams()
    const datasetParams = searchParams.getAll('indexDataset')
    if (datasetParams.length == 1) {
        return datasetParams[0]
    }
    return 'all'
}

export function useMode() {
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    return searchParams?.get('mode') || contentSettings[perspective]?.display || 'map'
}


/**
 * 
 * @returns searchQuery: URLSearchParams object with the search query
 * @returns searchQueryString: searchQuery as a string
 * @returns searchFilterParamsString: search params except dataset

 */
export function useSearchQuery() {
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const validFields = ['q', ...Object.keys(fieldConfig[perspective])]
    const facetFilters: [string, string][] = []
    const datasetFilters: [string, string][] = []
    const searchQuery = new URLSearchParams()
    const nav = searchParams.get('nav')
    const size = useQueryState('size', parseAsInteger.withDefault(20))[0]
    

    validFields.forEach(field => {
        const values = searchParams.getAll(field)
        values.forEach(value => {
            searchQuery.append(field, value)
            if (field == 'indexDataset') {
                datasetFilters.push([field, value])
            }
            else if (field != 'q') {
                facetFilters.push([field, value])
            }
        })
    })

    searchParams.forEach((value, key) => {
        if (!validFields.includes(key) && (key.startsWith('rawData') || key.startsWith('misc'))) {
            searchQuery.append(key, value)
            facetFilters.push([key, value])
        } else {
            // Handle range filters
            const comparisonMatch = key.match(/^(.+)_(gt|gte|lt|lte)$/);
            if (comparisonMatch) {
                const [, fieldName] = comparisonMatch;
                if (validFields.includes(fieldName)) {
                    searchQuery.append(key, value)
                    //facetFilters.push([key, value])
                }
            }
        }
    })




    

    const searchFilterParamsString = searchQuery.toString()
    
    // Params that don't require the results section to be shown
    //searchQuery.set('dataset', dataset)
    
    const fulltext = searchParams.get('fulltext')
    if (fulltext && nav != 'tree') {
        searchQuery.set('fulltext', 'on')
    }

    const removeFilterParams = (key: string | string[]) => {
        const outputUrl = new URLSearchParams(searchQuery)
        if (Array.isArray(key)) {
            key.forEach(k => outputUrl.delete(k))
        } else {
            outputUrl.delete(key)
        }
        return outputUrl.toString()
    }

    // Tree params
    /*
    if (false && treeView) {
        searchQuery.append('sosi', 'gard')
        const adm = searchParams.get('adm')
        size = 0
        if (adm) {
            searchQuery.append('adm', adm)
            if (adm.split("__").length == contentSettings[dataset].adm) {
                size = 500
            }
        }
    }
    */


    return {searchQueryString: searchQuery.toString(), searchQuery, searchFilterParamsString, facetFilters, removeFilterParams, size, datasetFilters }
}