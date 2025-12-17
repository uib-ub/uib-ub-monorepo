import { fieldConfig } from '@/config/search-config';
import { useSearchParams } from 'next/navigation';
import { usePerspective } from './param-hooks';



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
    const size = parseInt(searchParams.get('size') || "20")
    const datasetTag = searchParams.get('datasetTag')




    searchParams.forEach((value, key) => {
        if (validFields.includes(key)) {
            if (key == 'dataset') {
                datasetFilters.push([key, value])
            }
            /*else if (key == 'datasetTag') {
                datasetFilters.push([key, value])
                
            }*/
            else if (key != 'q') {
                searchQuery.append(key, value)
                facetFilters.push([key, value])
            }
            else {
                searchQuery.append(key, value)
            }
        }
        else if (!validFields.includes(key) && (key.startsWith('rawData') || key.startsWith('misc'))) {
            searchQuery.append(key, value)
            facetFilters.push([key, value])
        } else {
            // Handle range filters
            const comparisonMatch = key.match(/^(.+)_(gt|gte|lt|lte)$/);
            if (comparisonMatch) {
                const [, fieldName] = comparisonMatch;
                if (fieldName != 'boost' && validFields.includes(fieldName)) {
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
    const urlDatasetTag = searchParams.get('datasetTag')
    const tree = searchParams.get('tree')
    // Only include datasetTag in API query strings when it's relevant:
    // - always include non-tree datasetTags (e.g. 'deep', 'base')
    // - include 'tree' only when `tree` is present (tree param is the source of truth)
    if (urlDatasetTag && (urlDatasetTag !== 'tree' || !!tree)) {
        searchQuery.set('datasetTag', urlDatasetTag)
    }

    // Params that aren't considered filters
    const fulltext = searchParams.get('fulltext')
    if (fulltext && !tree && searchParams.get('q')) {
        searchQuery.set('fulltext', 'on')
    }
    

    if (searchParams.get('radius') && searchParams.get('point')) {
        searchQuery.set('radius', searchParams.get('radius')!)
        searchQuery.set('point', searchParams.get('point')!)
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