import { useSearchParams } from 'next/navigation'
import { fieldConfig } from '@/config/search-config';
import { contentSettings } from '@/config/server-config';
import { parseAsInteger, useQueryState } from 'nuqs';

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
    const nav = useQueryState('nav')[0]
    let size = useQueryState('size', parseAsInteger.withDefault(20))[0]
    

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




    

    const searchFilterParamsString = searchQuery.toString()
    // Params that don't require the results section to be shown
    if (searchParams.get('dataset')) {
        searchQuery.set('dataset', dataset)
    }
    const fulltext = searchParams.get('fulltext')
    if (fulltext && nav != 'tree') {
        searchQuery.set('fulltext', 'on')
    }

    const removeFilterParams = (key: string) => {
        const outputUrl = new URLSearchParams(searchQuery)
        outputUrl.delete(key)
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


    return {searchQueryString: searchQuery.toString(), searchQuery, searchFilterParamsString, facetFilters, removeFilterParams, size }
}