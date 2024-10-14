import { useSearchParams } from 'next/navigation'

export function useQueryWithout(omit : string[]) {
    const params = useSearchParams()
    const paramsArray = Array.from(params.entries());
    // IF in omit or first character is underscore
    return  paramsArray.filter(([key]) => !omit.includes(key) && key[0] !== '_');

}

export function useQueryStringWithout(omit : string[]) {
    return new URLSearchParams(useQueryWithout(omit)).toString();
}



export function useSearchQuery() {
    // Return params matching certain criteria
    // - q, size, page, starts with "rawData"
    const fields = ['q'] // TODO: add fields depending on dataset
    const searchParams = useSearchParams()
    const searchQuery = new URLSearchParams()


    fields.forEach(field => {
        if (searchParams.has(field)) {
            searchQuery.set(field, searchParams.get(field)!)
        }
    })
    searchParams.forEach((value, key) => {
        if (key.startsWith('rawData')) {
            searchQuery.set(key, value)
        }
    })

    const showResults = searchQuery.toString()
    // Params that don't require the results section to be shown
    searchQuery.set('dataset', searchParams.get('dataset') || 'search')

    return {searchQueryString: searchQuery.toString(), searchQuery, showResults}
}