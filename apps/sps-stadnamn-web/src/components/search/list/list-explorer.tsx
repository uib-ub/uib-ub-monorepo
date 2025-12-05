'use client'
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocSkeleton from "@/components/doc/doc-skeleton"
import { useMode } from '@/lib/param-hooks'
import useCollapsedData from "@/state/hooks/collapsed-data"
import useGroupData from "@/state/hooks/group-data"
import useSearchData from "@/state/hooks/search-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext, useEffect } from "react"
import CoordinateMenu from "../details/coordinate-menu"
import DocInfo from "../details/doc/doc-info"
import DocToolbar from "../details/doc/doc-toolbar"

function DocItem({ item, index, group, isMobile }: any) {

    const docDataset = item._index.split('-')[2]
    const images = item._source.image?.manifest ? { manifest: item._source.image?.manifest, dataset: docDataset } : item._source.images

    return (
        <li key={item._source.uuid} className={`flex  ${isMobile ? 'flex-col !py-0' : 'justify-between gap-4 p-2'}`}>
            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images} /></div>}
            <div className="flex flex-col p-2 w-full">
                <DocInfo docParams={{ docDataset, docData: item }} />
                <div className="flex 2xl:justify-between gap-2 2xl:px-4">
                    <DocToolbar docData={item} />
                    {!docDataset?.endsWith('_g') && <CoordinateMenu />}
                </div>
            </div>
            {!isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images} /></div>}
        </li>
    )
}


export default function ListExplorer() {

    const { isMobile } = useContext(GlobalContext)
    const { groupData, groupLoading, groupTotal } = useGroupData()
    const searchParams = useSearchParams()
    const group = searchParams.get('group')
    const mode = useMode()
    const datasetTag = searchParams.get('datasetTag')
    const { searchLoading } = useSearchData()
    const { collapsedData } = useCollapsedData()
    const router = useRouter()



    // Handle URL update in the component, not the hook
    useEffect(() => {
        console.log(!searchLoading, !group, (mode !== 'map' || datasetTag == 'base'))
        if (!searchLoading && !group && (mode !== 'map' || datasetTag == 'base')) {
            console.log("YES")
            const firstItem = collapsedData?.pages?.[0]?.data?.[0];
            if (!firstItem) return;

            const firstItemGroupId = firstItem.fields?.['group.id']?.[0];
            const firstItemUuid = firstItem.fields?.uuid[0];

            if (firstItemGroupId && firstItemUuid) {
                const currentParams = new URLSearchParams(searchParams.toString());
                currentParams.set('group', btoa(firstItemGroupId));
                //currentParams.set('detail', 'results');

                router.replace(`?${currentParams.toString()}`);
            }
        }
    }, [router, searchParams, mode, searchLoading, group, datasetTag, collapsedData, groupData]);

    return (
        <ul className={`flex bg-white flex-col divide-y divide-neutral-200 instance-info ${isMobile ? 'gap-4' : 'gap-8'} ${groupData && groupLoading ? 'opacity-50' : ''}`}>
            {!groupData &&

                <li className={`flex w-full flex-col p-4 xl:p-8 my-4 xl:my-8`}>
                    <DocSkeleton />
                </li>
            }


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

            {Array(groupTotal - groupData?.length).fill(null).map((_, index) => (
                <li key={`skeleton-${index}`} className={`flex w-full flex-col p-4 xl:p-8 my-4 xl:my-8`}>
                    <DocSkeleton />
                </li>
            ))}



            {/* Show a few skeleton items for loading feedback */}

        </ul>
    )

}


