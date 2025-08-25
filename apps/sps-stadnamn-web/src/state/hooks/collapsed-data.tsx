'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useRef } from 'react';

const PER_PAGE = 40;

const collapsedDataQuery = async ({
    pageParam = 0,
    searchQueryString,
}: { pageParam?: number; searchQueryString: string }) => {       
    const res = await fetch(`/api/search/collapsed?${searchQueryString}&size=${PER_PAGE}&from=${pageParam * PER_PAGE}`)
    if (!res.ok) {
        throw new Error('Failed to fetch page')
    }
    const data = await res.json()
    
    return {
        data: data.hits?.hits,
        nextCursor: data.hits?.hits.length === PER_PAGE ? pageParam + 1 : undefined
    }
}

export default function useCollapsedData() {
    const searchParams = useSearchParams()
    const initialPage = parseInt(searchParams.get('page') || '1')
    const initialPageRef = useRef(initialPage)
    const { searchQueryString } = useSearchQuery()

    const {
        data,
        error: collapsedError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status
    } = useInfiniteQuery({
        queryKey: ['collapsedData', searchQueryString],
        queryFn: ({ pageParam }) => collapsedDataQuery({ 
            pageParam, 
            searchQueryString 
        }),
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        data,
        collapsedError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status,
        initialPage: initialPageRef.current
    }
}




