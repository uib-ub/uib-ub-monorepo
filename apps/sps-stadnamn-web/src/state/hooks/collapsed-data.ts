'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useRef } from 'react';

const PER_PAGE = 40;

const collapsedDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    sortPoint
}: { pageParam?: number; searchQueryString: string, sortPoint: string | null}) => {       

    const newParams = new URLSearchParams(searchQueryString);
    newParams.set('size', PER_PAGE.toString());
    newParams.set('from', (pageParam * PER_PAGE).toString());
    if (sortPoint) {
        newParams.set('sortPoint', sortPoint);
    }
    const res = await fetch(`/api/search/collapsed?${newParams.toString()}`)
    if (!res.ok) {
        throw new Error(res.status.toString())
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
    const sortPoint = searchParams.get('sortPoint')
    
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status
    } = useInfiniteQuery({
        queryKey: ['collapsedData', searchQueryString, sortPoint],
        queryFn: ({ pageParam }) => collapsedDataQuery({ 
            pageParam, 
            searchQueryString,
            sortPoint
        }),
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        collapsedData: data,
        collapsedError: error,
        collapsedFetchNextPage: fetchNextPage,
        collapsedHasNextPage: hasNextPage,
        isFetchingNextPage: isFetchingNextPage,
        collapsedFetching: isFetching,
        collapsedLoading: isLoading,
        collapsedStatus: status,
        collapsedInitialPage: initialPageRef.current,

    }
}




