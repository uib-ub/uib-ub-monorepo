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
    const fields = ['q', 'size', 'page']
    const searchParams = useSearchParams()
    const filteredSearchParams = new URLSearchParams()
    filteredSearchParams.set('dataset', searchParams.get('dataset') || 'search')


    fields.forEach(field => {
        if (searchParams.has(field)) {
            filteredSearchParams.set(field, searchParams.get(field)!)
        }
    })
    searchParams.forEach((value, key) => {
        if (key.startsWith('rawData')) {
            filteredSearchParams.set(key, value)
        }
    })

    return {searchQueryString: filteredSearchParams.toString(), searchQuery: filteredSearchParams}
}