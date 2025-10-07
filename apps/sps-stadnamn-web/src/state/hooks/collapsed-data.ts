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
    initBoost,
    initPlaceScore,
    initGroupData,

}: { pageParam?: number; searchQueryString: string, initGroupCode: string | null, initBoost: number | null, initPlaceScore: number | null, initGroupData: Record<string, any> | null }) => {      
    

    const initGroupValue = initGroupCode ? base64UrlToString(initGroupCode) : undefined
    const initLocation = initGroupData?.sources[0]?.location?.coordinates || undefined
    const initLabel = initGroupData?.sources[0]?.label || undefined

    

    const res = await fetch(`/api/search/collapsed?${searchQueryString}`, {
        method: 'POST',
        body: JSON.stringify({
            size: PER_PAGE,
            from: pageParam * PER_PAGE,
            initGroup: initGroupData?.group,
            initBoost: initGroupData?.boost,
            initPlaceScore: initGroupData?.placeScore,
            initLocation,
            initLabel,
        })
    })
    if (!res.ok) {
        console.error("Error fetching collapsed data", res.status)
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
    const initGroupCode = searchParams.get('init')
    const { groupData, groupFetching } = useGroupData(initGroupCode)
    
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
        queryKey: ['collapsedData', searchQueryString, groupFetching, initGroupCode],
        queryFn: ({ pageParam }) => collapsedDataQuery({ 
            pageParam, 
            searchQueryString,
            initGroupCode: initGroupCode,
            initBoost: groupData?.boost,
            initPlaceScore: groupData?.placeScore,
            initGroupData: groupData,
        }),
        placeholderData: (prevData) => prevData,
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




