'use client'

import { useSearchQuery } from "@/lib/search-params"
import { useQuery } from "@tanstack/react-query"

const searchDataQuery = async (searchQueryString: string) => {
    const res = await fetch(`/api/search${searchQueryString ? '?' + searchQueryString : ''}`)
    if (!res.ok) {
        throw new Error('Failed to fetch search data')
    }
    const data = await res.json()

    const newBounds = data.aggregations?.viewport.bounds
    if (newBounds?.top_left && newBounds?.bottom_right) {
        let limitedBounds = [
            [newBounds.top_left.lat, Math.min(newBounds.top_left.lon, 33)], // East of Murmansk ~33°E
            [Math.max(newBounds.bottom_right.lat, 55.6), newBounds.bottom_right.lon] // South of Copenhagen ~55.6°N
        ] as [[number, number], [number, number]]

        // Calculate bounds based on zoom level if bounds are a single point
        if (limitedBounds[0][0] === limitedBounds[1][0] && limitedBounds[0][1] === limitedBounds[1][1]) {
            // At zoom level 11, each degree is approximately 0.1 degrees
            const offset = 0.1;
            limitedBounds = [
                [limitedBounds[0][0] + offset, limitedBounds[0][1] - offset],
                [limitedBounds[1][0] - offset, limitedBounds[1][1] + offset]
            ]
        }
        data.limitedBounds = limitedBounds
    }



    return data
}

export default function useSearchData() {
    const { searchQueryString } = useSearchQuery()


    // Map data query
    const { data, error, isLoading, dataUpdatedAt } = useQuery({
        queryKey: ['mapData', searchQueryString],
        placeholderData: (prevData: any) => prevData,
        queryFn: async () => searchDataQuery(searchQueryString),
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })


    return {
        searchData: data?.hits?.hits || null,
        totalHits: data?.hits?.total || null,
        searchError: error,
        searchLoading: isLoading,
        searchBounds: data?.limitedBounds || null,
        searchUpdatedAt: dataUpdatedAt
    }
}