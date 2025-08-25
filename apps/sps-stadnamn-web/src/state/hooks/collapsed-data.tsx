'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useCallback, useMemo } from 'react';

const collapsedDataQuery = async (searchQueryString: string, pageParam: { size: number, from: number }) => {
        const res = await fetch(`/api/search/collapsed?${searchQueryString}&size=${pageParam.size}&from=${pageParam.from}`)
        if (!res.ok) {
            throw new Error('Failed to fetch page')
        }
        const data = await res.json()
        
        return {
            hits: data.hits?.hits || [],
            total: data.hits?.total,
            size: pageParam.size,
            from: pageParam.from
        }
}

export default function useCollapsedData() {
    const searchParams = useSearchParams()
    const { searchQueryString } = useSearchQuery()
    const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page') || '0') : 0
    const PER_PAGE = 20
    
    // Calculate initial page parameters based on the page URL param
    const initialPageParam = useMemo(() => {
        return {
            size: PER_PAGE,
            from: initialPage * PER_PAGE
        }
    }, [initialPage])

    // Use select to transform data and control when re-renders happen
    const {
        data,
        error,
        isLoading,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
        isFetchingNextPage,
        isFetchingPreviousPage
    } = useInfiniteQuery({
        queryKey: ['collapsed', searchQueryString],
        queryFn: async ({ pageParam }) => collapsedDataQuery(searchQueryString, pageParam),
        initialPageParam,
        
        // For determining the next page params
        getNextPageParam: (lastPage) => {
            // If we've fetched all items or there are no hits
            if (!lastPage.total || lastPage.from + lastPage.hits.length >= lastPage.total.value) {
                return undefined
            }
            
            return {
                size: lastPage.size,
                from: lastPage.from + lastPage.size
            }
        },
        
        // For determining the previous page params
        getPreviousPageParam: (firstPage) => {
            // If we're already at the beginning
            if (firstPage.from === 0) {
                return undefined
            }
            
            return {
                size: firstPage.size,
                from: Math.max(0, firstPage.from - firstPage.size)
            }
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Only re-render when data actually changes (not on intermediate fetches)
        notifyOnChangeProps: ['data', 'error'],
    })
    
    // Process the data to expose in a consistent format
    const processedData = useMemo(() => {
        if (!data) return { allHits: [], totalData: null, shouldExposeData: false }
        
        // Flatten all pages into a single array of hits
        const allHits = data.pages.flatMap(page => page.hits)
        const totalData = data.pages[0]?.total || null
        
        return {
            allHits,
            totalData,
            shouldExposeData: !isFetchingNextPage && !isFetchingPreviousPage
        }
    }, [data, isFetchingNextPage, isFetchingPreviousPage])

    // Custom loadMore function that handles both directions
    const loadMore = useCallback((direction: 'next' | 'previous') => {
        if (direction === 'next') {
            fetchNextPage()
        } else {
            fetchPreviousPage()
        }
    }, [fetchNextPage, fetchPreviousPage])

    return { 
        collapsedResults: processedData.allHits || [],
        collapsedTotal: processedData.totalData || null,
        collapsedError: error, 
        collapsedLoading: isLoading || ((isFetchingNextPage || isFetchingPreviousPage) && !processedData.shouldExposeData),
        fetchNext: fetchNextPage,
        fetchPrevious: fetchPreviousPage,
        loadMore,
        canFetchNext: hasNextPage,
        canFetchPrevious: hasPreviousPage,
        isFetchingNext: isFetchingNextPage,
        isFetchingPrevious: isFetchingPreviousPage
    }
}

