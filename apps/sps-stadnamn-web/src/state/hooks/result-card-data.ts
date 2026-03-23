'use client'
import { base64UrlToString } from '@/lib/param-utils';
import { useSearchQuery } from '@/lib/search-params';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useGroupParam, useInitParam, useQParam, useSourceViewOn } from '@/lib/param-hooks';

const resultCardDataQuery = async (
    id: string,
    sourceView: boolean,
    group: string | null,
) => {
    const newParams = new URLSearchParams();
    newParams.set('id', id);
    if (sourceView) {
        newParams.set('sourceView', 'on');
    }
    if (group) {
        newParams.delete('q');
    }

    const res = await fetch(`/api/card?${newParams.toString()}`);

    if (!res.ok) {
        throw new Error('Failed to fetch group');
    }
    const data = await res.json()

    return data;
};

type UseResultCardDataOptions = {
    forceGroupLookup?: boolean
}

export default function useResultCardData(itemId?: string | null, options?: UseResultCardDataOptions) {
    const { searchQueryString } = useSearchQuery()
    const init = useInitParam()
    const group = useGroupParam()
    const id = itemId || init || group
    const idDecoded = id && [init, group].includes(id) ? base64UrlToString(id) : id
    const sourceViewOn = useSourceViewOn()    
    const effectiveSourceView = options?.forceGroupLookup ? false : sourceViewOn

    const {
        data: returnedData,
        error: resultCardError,
        isLoading: resultCardLoading,
        isRefetching: resultCardRefetching,
        isFetching: resultCardFetching,
        status,
    } = useQuery({
        queryKey: ['result-card', id, effectiveSourceView, searchQueryString],
        queryFn: async () =>
            idDecoded ? resultCardDataQuery(idDecoded, effectiveSourceView, group) : null,
        placeholderData: (itemId || init == id) ? undefined : (prevData: any) => prevData,

    })

    // Normalize the shape so existing components can rely on
    // `groupData.label` and `groupData.coordinates` even if the API
    // response only exposes these via `fields`/`sources`.


    const processedData = returnedData
        ? {
            ...returnedData,
            id: (returnedData as any).id,
            label: (returnedData as any).label,
            coordinates:
                (returnedData as any).coordinates
                ?? (Array.isArray((returnedData as any).fields?.location?.coordinates)
                    ? (returnedData as any).fields.location.coordinates
                    : Array.isArray((returnedData as any).sources?.[0]?.location?.coordinates)
                        ? (returnedData as any).sources[0].location.coordinates
                        : undefined),
        }
        : null


    return {
        resultCardData: processedData,
        resultCardTotal: processedData?.total,
        resultCardError,
        resultCardLoading, //|| (isFetchingNextPage && !processedData?.shouldExposeData),
        resultCardRefetching,
        resultCardFetching,
        resultCardStatus: status,
    }
}
