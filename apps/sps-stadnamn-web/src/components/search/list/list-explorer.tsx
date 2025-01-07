import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../info/doc-info"
import { GlobalContext } from "@/app/global-provider"

export default function ListExplorer() {
    const searchParams = useSearchParams()
    const { tableData, totalHits, isLoading } = useContext(SearchContext)
    const { isMobile } = useContext(GlobalContext)

    return <div  className='flex flex-col py-2 gap-4 h-full'>


                    <ul className="flex flex-col divide-y divide-neutral-200 instance-info !pt-0 gap-8">
                        {tableData?.map((item: any, index: number) => {
                            const docDataset = item._index.split('-')[2]
                            return <li key={index} className={`p-2 !py-4 flex ${isMobile ? 'flex-col gap-4' : ''}`}>
                                
                                { isMobile && item._source.image?.manifest && <div className="ml-auto"><ClientThumbnail manifestId={item._source.image?.manifest}/></div>}
                                <div className="flex flex-col px-4">
                                <DocInfo docParams={{docDataset, docData: item, snidParent: null, sameMarkerList: []}}/>
                                </div>
                                { !isMobile && item._source.image?.manifest && <div className="ml-auto"><ClientThumbnail manifestId={item._source.image?.manifest}/></div>}
                                
                            </li>
                      
                        })}
                    </ul>
                    
                    
                    <nav className="center gap-2 mx-2 pb-4">

                    { totalHits && totalHits.value > 10 && <Pagination totalPages={Math.ceil(totalHits.value / (Number(searchParams.get('perPage')) || 10))}/>}
                    </nav>
                    
                    </div>

}
                    
                  
