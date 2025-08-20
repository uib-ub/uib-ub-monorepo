import { useContext, useMemo, useCallback } from "react"
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../details/doc/doc-info"
import { GlobalContext } from "@/app/global-provider"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "@/components/doc/doc-skeleton"
import DocToolbar from "../details/doc/doc-toolbar"
import CoordinateMenu from "../details/coordinate-menu"
import useGroupNavigation from "@/state/hooks/group-navigation"
import React from "react"

// Dynamic import for the actual doc item content
const DocItemContent = dynamic(() => Promise.resolve(({ item, index, group, isMobile }: any) => {
    const docDataset = item._index.split('-')[2]
    const images = item._source.image?.manifest ? {manifest: item._source.image?.manifest, dataset: docDataset} : item._source.images    
    return (
        <li key={index + (group || '')} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'}`}>
            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
            <div className="flex flex-col p-2 w-full">
                <DocInfo docParams={{docDataset, docData: item}}/>
                <div className="flex 2xl:justify-between gap-2 2xl:px-4">
                    <DocToolbar docData={item}/>
                    {!docDataset.endsWith('_g') && <CoordinateMenu/>}
                </div>
            </div>
            {!isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
        </li>
    )
}), {
    ssr: false,
    loading: () => (
        <li className="flex justify-between gap-4 p-2 min-h-[120px]">
            <DocSkeleton />
        </li>
    )
})

function LazyDocItem({ item, index, group, isMobile }: any) {
    const { ref, inView } = useInView({
        rootMargin: '200px',
        triggerOnce: true
    })

    return (
        <div ref={ref}>
            {inView ? (
                <DocItemContent item={item} index={index} group={group} isMobile={isMobile} />
            ) : (
                <li className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'} min-h-[120px]`}>
                    <DocSkeleton />
                </li>
            )}
        </div>
    )
}

function SkeletonItem({ isMobile }: { isMobile: boolean }) {
    return (
        <li className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'} min-h-[120px]`}>
            <DocSkeleton />
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
    const {groupData, groupLoading, groupTotal, fetchMore, canFetchMore} = useGroupNavigation()
    const searchParams = useSearchParams()
    const group = searchParams.get('group')

    // Create array with loaded items only
    const displayItems = useMemo(() => {
        return groupData?.map((item: any, index: number) => ({
            type: 'loaded',
            data: item,
            index
        })) || []
    }, [groupData])

    // Calculate how many skeleton items to show for loading feedback
    const skeletonCount = useMemo(() => {
        if (!canFetchMore) return 0
        return Math.min(5, (groupTotal?.value || 0) - (groupData?.length || 0))
    }, [canFetchMore, groupTotal?.value, groupData?.length])

    // Handle infinite scroll
    const handleLoadMore = useCallback(() => {
        if (canFetchMore && !groupLoading) {
            fetchMore()
        }
    }, [canFetchMore, groupLoading, fetchMore])

    return (
        <ul className={`flex flex-col divide-y divide-neutral-200 instance-info ${isMobile ? 'gap-4' : 'gap-8'} ${groupLoading ? 'opacity-50' : ''}`}>
            TOTAL: {groupTotal?.value} LOADED: {groupData?.length}
            {displayItems.map((item: any, index: number) => {
                const loadedItem: Record<string, any> = item.data
                if (item.index < 3) {
                    const docDataset = loadedItem._index.split('-')[2]
                    const images = loadedItem._source.image?.manifest ? {manifest: loadedItem._source.image?.manifest, dataset: docDataset} : loadedItem._source.images
                    return (
                        <li key={item.index + (group || '')} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'}`}>
                            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                            <div className="flex flex-col p-2 w-full">
                                <DocInfo docParams={{docDataset, docData: loadedItem}}/>
                                <div className="flex 2xl:justify-between gap-2 2xl:px-4">
                                    <DocToolbar docData={loadedItem}/>
                                    {!docDataset.endsWith('_g') && <CoordinateMenu/>}
                                </div>
                            </div>
                            {!isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                        </li>
                    )
                }
                
                return <LazyDocItem key={`lazy-${item.index}`} item={loadedItem} index={item.index} group={group} isMobile={isMobile} />
            })}
            
            {/* Infinite scroll trigger - placed after loaded items */}
            {canFetchMore && (
                <InfiniteScrollTrigger onLoadMore={handleLoadMore} canLoadMore={canFetchMore} />
            )}
            
            {/* Show a few skeleton items for loading feedback */}
            {skeletonCount > 0 && (
                <>
                    {Array(skeletonCount).fill(null).map((_, index) => (
                        <SkeletonItem key={`skeleton-${index}`} isMobile={isMobile} />
                    ))}
                </>
            )}
        </ul>
    )
}
                    
                  
