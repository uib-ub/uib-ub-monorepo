import { fieldConfig } from '@/config/search-config';
import { useSearchParams } from 'next/navigation';
import { useDatasetTagParam, useFulltextOn, useFuzzyOn, useGroupParam, usePerPageNumber, usePerspective, usePointParam, useQParam, useRadiusParam, useSourceViewOn, useTreeParam } from './param-hooks';
import { isClientOnlySearchParamKey } from './reserved-param-types';



/**
 * 
 * @returns searchQuery: URLSearchParams object with the search query
 * @returns searchQueryString: searchQuery as a string
 * @returns searchFilterParamsString: search params except dataset

 */
export function useSearchQuery() {
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const validFields = new Set(Object.keys(fieldConfig[perspective]))
    const facetFilters: [string, string][] = []
    const datasetFilters: [string, string][] = []
    const searchQuery = new URLSearchParams()
    const size = usePerPageNumber()
    const group = useGroupParam()
    const sourceViewOn = useSourceViewOn()
    const tree = useTreeParam()
    const datasetTag = useDatasetTagParam()
    const qParam = useQParam()
    const fuzzyOn = useFuzzyOn()
    const fulltextOn = useFulltextOn()
    const radius = useRadiusParam()
    const point = usePointParam()




    searchParams.forEach((value, key) => {
        if (key == 'q') {
            searchQuery.append('q', value)
        }
        if (key == 'dataset') {
            datasetFilters.push([key, value])
        }
        else if (isClientOnlySearchParamKey(key)) {
            return
        }
        else if (validFields.has(key)) {
            searchQuery.append(key, value)
            if (fieldConfig[perspective]?.[key]?.facet) {
                facetFilters.push([key, value])
            }
        }
        else if ((key.startsWith('group.') || key.startsWith('rawData.') || key.startsWith('misc.'))) {
            searchQuery.append(key, value)
            facetFilters.push([key, value])
        } else {
            // Handle range filters
            const comparisonMatch = key.match(/^(.+)_(gt|gte|lt|lte)$/);
            if (comparisonMatch) {
                const [, fieldName] = comparisonMatch;
                if (fieldName != 'boost' && validFields.has(fieldName)) {
                    searchQuery.append(key, value)
                    //facetFilters.push([key, value])
                }
            }
        }
    })


    datasetFilters.forEach(filter => {
        searchQuery.append(filter[0], filter[1])
    })



    const searchFilterParamsString = searchQuery.toString()

    // Only include datasetTag in API query strings when it's relevant:
    // - always include non-tree datasetTags (e.g. 'deep', 'base')
    // - include 'tree' only when `tree` is present (tree param is the source of truth)
    if (datasetTag && (datasetTag !== 'tree' || !!tree)) {
        searchQuery.set('datasetTag', datasetTag)
    }

    

    // Params that aren't considered filters
    // Fulltext is silently enabled when a group is selected

    if ((fulltextOn || group) && !tree && qParam) {
        searchQuery.set('fulltext', 'on')
    }

    if (fuzzyOn && qParam) {
        searchQuery.set('fuzzy', 'on')
    }

    if (sourceViewOn) {
        searchQuery.set('sourceView', 'on')
        if (group) {
            searchQuery.set('group', group)
        }
    }




    const removeFilterParams = (key: string | string[], keep?: string[]) => {
        const outputUrl = new URLSearchParams(searchQuery)
        const keys = Array.isArray(key) ? key : [key]
        keys.forEach(k => {
            const values = keep ? outputUrl.getAll(k).filter(v => keep.includes(v)) : []
            outputUrl.delete(k)
            values.forEach(v => outputUrl.append(k, v))
        })
        return outputUrl.toString()
    }



    return { searchQueryString: searchQuery.toString(), searchQuery, searchFilterParamsString, facetFilters, removeFilterParams, size, datasetFilters }
}