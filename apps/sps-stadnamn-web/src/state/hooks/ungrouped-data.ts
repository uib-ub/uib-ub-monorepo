'use client'
import { calculateDistance } from '@/lib/map-utils';
import { usePoint } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import { parseTreeParam } from '@/lib/tree-param';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export const INITIAL_PAGE_SIZE = 10;
export const SUBSEQUENT_PAGE_SIZE = 40;

const ungroupedQuery = async ({
    pageParam = 0,
    searchQueryString,
    searchSort,
    point,
    within,
}: {
    pageParam?: number;
    searchQueryString: string;
    searchSort: string | null;
    point: [number, number] | null;
    within: string | null;
}) => {
    const isFirstPage = pageParam === 0;
    const size = isFirstPage ? INITIAL_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE;
    const from = isFirstPage ? 0 : INITIAL_PAGE_SIZE + (pageParam - 1) * SUBSEQUENT_PAGE_SIZE;

    const params = new URLSearchParams(searchQueryString);
    params.delete('ungrouped');
    params.set('size', size.toString());
    params.set('from', from.toString());
    if (searchSort) params.set('searchSort', searchSort);
    if (point) params.set('point', `${point[0]},${point[1]}`);
    if (within) params.set('within', within);

    const res = await fetch(`/api/search/table?${params.toString()}`);
    if (!res.ok) {
        throw new Error(res.status.toString());
    }

    const data = await res.json();
    const hits = data?.hits?.hits || [];

    if (point) {
        const [initLat, initLon] = point;
        hits.forEach((hit: any) => {
            const hitLocation = hit._source?.location?.coordinates || hit.fields?.location?.[0]?.coordinates;
            if (hitLocation && hitLocation.length === 2) {
                const [hitLon, hitLat] = hitLocation;
                hit.distance = calculateDistance(initLat, initLon, hitLat, hitLon);
            }
        });
    }

    return {
        data: hits,
        nextCursor: hits.length === size ? pageParam + 1 : undefined,
    };
};

export default function useUngroupedData() {
    const { searchQueryString } = useSearchQuery();
    const searchParams = useSearchParams();
    const initialPage = parseInt(searchParams.get('page') || '1');
    const initialPageRef = useRef(initialPage);
    const searchSort = searchParams.get('searchSort');
    const point = usePoint();
    const tree = searchParams.get('tree');
    const doc = searchParams.get('doc');
    const treeUuid = parseTreeParam(searchParams.get('tree')).uuid;
    const cadastreDoc = tree ? (treeUuid || doc) : null;
    const ungrouped = searchParams.get('ungrouped') === 'on';

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isLoading,
        status,
    } = useInfiniteQuery({
        queryKey: ['ungroupedData', searchQueryString, searchSort, point, cadastreDoc],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            ungroupedQuery({
                pageParam,
                searchQueryString,
                searchSort,
                point,
                within: cadastreDoc,
            }),
        initialPageParam: initialPageRef.current - 1,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: ungrouped,
        staleTime: 1000 * 60 * 5,
    });

    return {
        ungroupedData: data,
        ungroupedError: error,
        ungroupedFetchNextPage: fetchNextPage,
        ungroupedHasNextPage: hasNextPage,
        ungroupedIsFetchingNextPage: isFetchingNextPage,
        ungroupedFetching: isFetching,
        ungroupedLoading: isLoading,
        ungroupedStatus: status,
        ungroupedInitialPage: initialPageRef.current,
    };
}
