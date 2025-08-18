import { useContext } from "react"
import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../details/doc/doc-info"
import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import DetailsFooter from "../details/details-footer"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "@/components/doc/doc-skeleton"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter } from "next/navigation"
import { stringToBase64Url } from "@/lib/utils"
import { SearchContext } from "@/app/search-provider"
import SearchResults from "../nav/results/search-results"
import DocToolbar from "../details/doc/doc-toolbar"
import CoordinateMenu from "../details/coordinate-menu"

// Dynamic import for the actual doc item content
const DocItemContent = dynamic(() => Promise.resolve(({ item, index, group, isMobile }: any) => {
    const docDataset = item._index.split('-')[2]
    const images = item._source.image?.manifest ? {manifest: item._source.image?.manifest, dataset: docDataset} : item._source.images
    
    return (
        <li key={index + (group || '')} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'}`}>
            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
            <div className="flex flex-col p-2 w-full">
                <DocInfo docParams={{docDataset, docData: item, sameMarkerList: []}}/>
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

export default function ListExplorer() {
    const { isMobile } = useContext(GlobalContext)
    const {groupData, groupLoading} = useContext(GroupContext)
    const { resultData } = useContext(SearchContext)
    const { docData } = useContext(DocContext)
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || groupData ? 'group' : 'doc'
    const group = searchParams.get('group')
    const doc = searchParams.get('doc')
    const { searchQueryString } = useSearchQuery()
    const router = useRouter()

    const items = details == 'doc' ? [docData] : groupData

    return <>
        {!items?.length  ? <div className="flex flex-col divide-y divide-neutral-200 instance-info !pt-0">
            <DocSkeleton/>
        </div> :
        <ul className={`flex flex-col divide-y divide-neutral-200 instance-info ${isMobile ? 'gap-4' : 'gap-8'} ${groupLoading ? 'opacity-50' : ''}`}>
            {items?.[0]?._source && items.map((item: any, index: number) => {
                // Render first 3 items immediately, lazy load the rest
                if (index < 3) {
                    const docDataset = item._index.split('-')[2]
                    const images = item._source.image?.manifest ? {manifest: item._source.image?.manifest, dataset: docDataset} : item._source.images
                    return (
                        <li key={index + (group || '')} className={`flex${isMobile ? 'flex-col' : 'justify-between gap-4 p-2'}`}>
                            {isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                            <div className="flex flex-col p-2 w-full">
                                <DocInfo docParams={{docDataset, docData: item, sameMarkerList: []}}/>
                                <div className="flex 2xl:justify-between gap-2 2xl:px-4">
                                    <DocToolbar docData={item}/>
                                    {!docDataset.endsWith('_g') && <CoordinateMenu/>}
                                </div>
                            </div>
                            {!isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                        </li>
                    )
                }
                
                return <LazyDocItem key={`lazy-${index}`} item={item} index={index} group={group} isMobile={isMobile} />
            })}
        </ul>
        }
    </>
}
                    
                  
