'use client'
import useCollapsedData, { SUBSEQUENT_PAGE_SIZE } from '@/state/hooks/collapsed-data';
import useUngroupedData, { SUBSEQUENT_PAGE_SIZE as UNGROUPED_SUBSEQUENT_PAGE_SIZE } from '@/state/hooks/source-view-data';
import { useSearchParams } from 'next/navigation';

export default function useResultsData() {
    const searchParams = useSearchParams();
    const sourceView = searchParams.get('sourceView') === 'on';

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
        sourceViewData,
        sourceViewError,
        sourceViewLoading,
        sourceViewFetchNextPage,
        sourceViewHasNextPage,
        sourceViewIsFetchingNextPage,
        sourceViewStatus,
        sourceViewInitialPage,
    } = useUngroupedData();

    return {
        resultData: sourceView ? sourceViewData : collapsedData,
        resultError: sourceView ? sourceViewError : collapsedError,
        resultLoading: sourceView ? sourceViewLoading : collapsedLoading,
        resultFetchNextPage: sourceView ? sourceViewFetchNextPage : collapsedFetchNextPage,
        resultHasNextPage: sourceView ? sourceViewHasNextPage : collapsedHasNextPage,
        resultIsFetchingNextPage: sourceView ? sourceViewIsFetchingNextPage : isFetchingNextPage,
        resultStatus: sourceView ? sourceViewStatus : collapsedStatus,
        resultInitialPage: sourceView ? sourceViewInitialPage : collapsedInitialPage,
        resultPageSize: sourceView ? UNGROUPED_SUBSEQUENT_PAGE_SIZE : SUBSEQUENT_PAGE_SIZE,
    };
}
