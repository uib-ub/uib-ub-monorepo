'use client'
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchQuery } from '@/lib/search-params';
import { useRef } from 'react';
import useGroupData from './group-data';
import { extractFacets } from '@/app/api/_utils/facets';
import { base64UrlToString } from '@/lib/param-utils';

const PER_PAGE = 40;

const collapsedDataQuery = async ({
    pageParam = 0,
    searchQueryString,
    initGroupCode,
    labelBounds

}: { pageParam?: number; searchQueryString: string, initGroupCode: string | null, labelBounds: string | null }) => {      
    
    

    const res = await fetch(`/api/search/collapsed?${searchQueryString}`, {
        method: 'POST',
        body: JSON.stringify({
            size: PER_PAGE,
            from: pageParam * PER_PAGE,
            ...initGroupCode ? {initGroup: base64UrlToString(initGroupCode)} : {},
            ...labelBounds ? {labelBounds} : {},
        })
    })
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
    const initGroupCode = searchParams.get('init') || searchParams.get('group')
    const { groupData, groupFetching } = useGroupData(initGroupCode)
    const labelBounds = searchParams.get('labelBounds')
    
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
        queryKey: ['collapsedData', searchQueryString, groupFetching, initGroupCode, labelBounds],
        queryFn: ({ pageParam }) => collapsedDataQuery({ 
            pageParam, 
            searchQueryString,
            initGroupCode,
            labelBounds
        }),
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !groupFetching,
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




