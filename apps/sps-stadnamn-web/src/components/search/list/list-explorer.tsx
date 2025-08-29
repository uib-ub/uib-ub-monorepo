import { useContext, useMemo, useCallback, useEffect } from "react"
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../details/doc/doc-info"
import { GlobalContext } from "@/app/global-provider"
import { useSearchParams, useRouter } from "next/navigation"
import DocSkeleton from "@/components/doc/doc-skeleton"
import DocToolbar from "../details/doc/doc-toolbar"
import CoordinateMenu from "../details/coordinate-menu"
import React from "react"
import { useInView } from 'react-intersection-observer'
import { useMode } from '@/lib/param-hooks';
import useCollapsedData from "@/state/hooks/collapsed-data"
import useSearchData from "@/state/hooks/search-data"
import useGroupData from "@/state/hooks/group-data"

function DocItem({ item, index, group, isMobile }: any) {
    const docDataset = item._index.split('-')[2]
    const images = item._source.image?.manifest ? {manifest: item._source.image?.manifest, dataset: docDataset} : item._source.images    
    
    return (
        <li key={item._source.uuid} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'}`}>
            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
            <div className="flex flex-col p-2 w-full">
                <DocInfo docParams={{docDataset, docData: item}}/>
                <div className="flex 2xl:justify-between gap-2 2xl:px-4">
                    <DocToolbar docData={item}/>
                    {!docDataset?.endsWith('_g') && <CoordinateMenu/>}
                </div>
            </div>
            {!isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
        </li>
    )
}

function InfiniteScrollTrigger({ onLoadMore, canLoadMore }: { onLoadMore: () => void, canLoadMore: boolean }) {
    const { ref, inView } = useInView({
        rootMargin: '200px',
        threshold: 0
    })

    // Trigger load more when in view
    React.useEffect(() => {
        if (inView && canLoadMore) {
            onLoadMore()
        }
    }, [inView, canLoadMore, onLoadMore])

    return <div ref={ref} className="h-1" />
}

export default function ListExplorer() {
    const { isMobile } = useContext(GlobalContext)
    const {groupData, groupLoading, groupTotal, fetchMore, canFetchMore} = useGroupData()
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const mode = useMode()
    const datasetTag = searchParams.get('datasetTag')
    const { searchLoading } = useSearchData()
    const { collapsedData } = useCollapsedData()
    const router = useRouter()

    // Handle infinite scroll
    const handleLoadMore = useCallback(() => {
        if (canFetchMore && !groupLoading) {
            fetchMore()
        }
    }, [canFetchMore, groupLoading, fetchMore])

    // Calculate how many skeleton items to show for loading feedback
    const skeletonCount = useMemo(() => {
        if (!canFetchMore) return 0
        return Math.min(5, (groupTotal?.value || 0) - (groupData?.length || 0))
    }, [canFetchMore, groupTotal?.value, groupData?.length])

      // Handle URL update in the component, not the hook
      useEffect(() => {
        console.log(!searchLoading, !group, (mode !== 'map' || datasetTag == 'base'))
        if (!searchLoading && !group  && (mode !== 'map' || datasetTag == 'base')) {
          console.log("YES")
            const firstItem = collapsedData?.pages?.[0]?.data?.[0];
            if (!firstItem) return;
          
            const firstItemGroupId = firstItem.fields?.['group.id']?.[0];
            const firstItemUuid = firstItem.fields?.uuid[0];
            
            if (firstItemGroupId && firstItemUuid) {
                const currentParams = new URLSearchParams(searchParams.toString());
                currentParams.set('doc', firstItemUuid);
                currentParams.set('group', btoa(firstItemGroupId));
                //currentParams.set('detail', 'results');
                
                router.replace(`?${currentParams.toString()}`);
            }
        }
      }, [router, searchParams, mode, searchLoading, group, datasetTag, collapsedData, groupData]);

    return (
        <ul className={`flex flex-col divide-y divide-neutral-200 instance-info ${isMobile ? 'gap-4' : 'gap-8'} ${groupLoading ? 'opacity-50' : ''}`}>
            
            {/* Render all loaded items directly - no lazy loading */}
            {groupData?.map((item: any, index: number) => (
                <DocItem 
                    key={item._source.uuid} 
                    item={item} 
                    index={index} 
                    group={group} 
                    isMobile={isMobile} 
                />
            ))}
            
            {/* Infinite scroll trigger - placed after loaded items */}
            {canFetchMore && (
                <InfiniteScrollTrigger onLoadMore={handleLoadMore} canLoadMore={canFetchMore} />
            )}
            
            {/* Show a few skeleton items for loading feedback */}
            {skeletonCount > 0 && (
                <>
                    {Array(skeletonCount).fill(null).map((_, index) => (
                        <li key={`skeleton-${index}`} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'} min-h-[120px]`}>
                            <DocSkeleton />
                        </li>
                    ))}
                </>
            )}
        </ul>
    )
}
                    
                  
