'use client'
import useCollapsedData, { SUBSEQUENT_PAGE_SIZE } from '@/state/hooks/collapsed-data';
import useUngroupedData, { SUBSEQUENT_PAGE_SIZE as UNGROUPED_SUBSEQUENT_PAGE_SIZE } from '@/state/hooks/ungrouped-data';
import { useSearchParams } from 'next/navigation';

export default function useResultsData() {
    const searchParams = useSearchParams();
    const ungrouped = searchParams.get('ungrouped') === 'on';

    const {
        collapsedData,
        collapsedError,
        collapsedLoading,
        collapsedFetchNextPage,
        collapsedHasNextPage,
        isFetchingNextPage,
        collapsedStatus,
        collapsedInitialPage,
    } = useCollapsedData();

    const {
        ungroupedData,
        ungroupedError,
        ungroupedLoading,
        ungroupedFetchNextPage,
        ungroupedHasNextPage,
        ungroupedIsFetchingNextPage,
        ungroupedStatus,
        ungroupedInitialPage,
    } = useUngroupedData();

    return {
        resultData: ungrouped ? ungroupedData : collapsedData,
        resultError: ungrouped ? ungroupedError : collapsedError,
        resultLoading: ungrouped ? ungroupedLoading : collapsedLoading,
        resultFetchNextPage: ungrouped ? ungroupedFetchNextPage : collapsedFetchNextPage,
        resultHasNextPage: ungrouped ? ungroupedHasNextPage : collapsedHasNextPage,
        resultIsFetchingNextPage: ungrouped ? ungroupedIsFetchingNextPage : isFetchingNextPage,
        resultStatus: ungrouped ? ungroupedStatus : collapsedStatus,
        resultInitialPage: ungrouped ? ungroupedInitialPage : collapsedInitialPage,
        resultPageSize: ungrouped ? UNGROUPED_SUBSEQUENT_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE,
    };
}
