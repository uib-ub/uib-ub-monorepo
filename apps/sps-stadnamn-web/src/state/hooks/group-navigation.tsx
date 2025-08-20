'use client'
import { useEffect } from 'react';
import useGroupData from './group-data';
import useDocData from './doc-data';

export default function useGroupNavigation() {
    const { 
        groupData, 
        groupTotal, 
        groupError, 
        groupLoading, 
        fetchMore, 
        canFetchMore 
    } = useGroupData();
    
    const { docData } = useDocData();
    const docUuid = docData?._source?.uuid;

    // Find current document index in the results
    const docIndex = docUuid ? groupData.findIndex((hit: any) => hit._source?.uuid === docUuid) : -1;

    // Auto-fetch more results for navigation purposes
    useEffect(() => {
        // Only fetch more if:
        // 1. We can fetch more
        // 2. Not currently loading
        // 3. We have fewer than 20 items AND
        // 4. Either no current doc OR the current doc is found and we need buffer around it
        const needsMoreForNavigation = canFetchMore && 
                                      !groupLoading &&
                                      groupData.length < 20 &&
                                      (docIndex === -1 || // Doc not found yet, keep fetching
                                       docIndex > groupData.length - 5); // Doc found but near end, need buffer

        if (needsMoreForNavigation) {
            console.log('🔄 Auto-fetching more results for navigation:', { 
                currentCount: groupData.length, 
                docIndex,
                docUuid 
            });
            fetchMore();
        }
    }, [groupData.length, canFetchMore, groupLoading, fetchMore, docIndex, docUuid]);

    return { 
        groupData, 
        groupTotal, 
        groupError, 
        groupLoading,
        fetchMore,
        canFetchMore
    };
}
