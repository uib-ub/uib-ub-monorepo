import { useContext } from "react"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../details/doc/doc-info"
import { GlobalContext } from "@/app/global-provider"
import { GroupContext } from "@/app/group-provider"
import DetailsFooter from "../details/details-footer"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"

export default function ListExplorer() {
    const { tableData, totalHits } = useContext(SearchContext)
    const { isMobile } = useContext(GlobalContext)
    const {groupData} = useContext(GroupContext)
    const { docData } = useContext(DocContext)
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || groupData ? 'group' : 'doc'

    const items = details == 'doc' ? [docData] : groupData
    
    return <div  className='flex flex-col py-2 gap-4 h-full'>


                    <ul className="flex flex-col divide-y divide-neutral-200 instance-info !pt-0 gap-8">
                        {
                        items?.[0]?._source && items.map((item: any, index: number) => {
                            const docDataset = item._index.split('-')[2]
                            const images = item._source.image?.manifest ? {manifest: item._source.image?.manifest, dataset: docDataset} : item._source.images
                            return <li key={index} className={`p-2 !py-4 flex ${isMobile ? 'flex-col gap-4' : 'justify-between gap-4'}`}>
                                
                                { isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                                <div className="flex flex-col px-4 w-full">
                                <DocInfo docParams={{docDataset, docData: item, sameMarkerList: []}}/>
                                {!docDataset.endsWith('_g') && <DetailsFooter/>}
                                </div>
                                { !isMobile && images?.length && <div className="lg:min-w-[20svw] lg:max-w-[20svw]"><ClientThumbnail iiif={images}/></div>}
                                
                            </li>
                      
                        })}
                    </ul>
                    
                    
                    
                    </div>

}
                    
                  
