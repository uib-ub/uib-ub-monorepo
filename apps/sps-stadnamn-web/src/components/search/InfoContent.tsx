import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./DatasetInfo"
import DocInfo from "./DocInfo"
import { getSkeletonLength } from "@/lib/utils"
import { useQueryState } from "nuqs"
import Spinner from "../svg/Spinner"
import { useSearchQuery } from "@/lib/search-params"


export default function InfoContent({expanded}: {expanded: boolean}) {

    const searchParams = useSearchParams()
    const [selected, setSelected] = useState<any[] | null>(null)
    const doc = useQueryState('doc')[0]
    const dataset = searchParams.get('dataset') || 'search'
    const point = useQueryState('point')[0]
    const [isLoading, setIsLoading] = useState(true)
    const { searchQueryString } = useSearchQuery()
    

    useEffect(() => {
        console.log("RUNNING")
        setIsLoading(true)
        
       
        if (doc) {

            fetch(`/api/uuid/${doc}`).then(res => res.json()).then(data => {
                console.log(data)
                if (data.hits?.hits?.length) {
                    setSelected(data.hits?.hits)
                    setIsLoading(false)
                }
            })

        }
        else if (point) {
            

            fetch(`/api/location?point=${point}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    console.log(data)
                    if (data.hits?.hits?.length) {
                        setSelected(data.hits?.hits)
                        setIsLoading(false)
                    }
            })
        }
        else {
            setSelected(null)
        }
            
    }
    , [doc, point, dataset])

    
    
    if (!selected || isLoading) {
        return isLoading ? null &&

        <div className="w-full flex items-center">
            <Spinner status="Laster inn data"/>


        </div>
        
        :  <DatasetInfo/> 
    }

    if (doc) {
        return <DocInfo doc={selected[0]}/>
    }
    else if (point) {
        return <article>{
            selected.map((hit: any) => {
                return <div key={hit._id} className="p-0">
                    <h2>{hit._source?.label}</h2>
                </div>
            })

            
        }

        </article>
    }


/*

    <button onClick={() => router.push("/search")}>TEST</button>
            { expanded && <div className="transition-all duration-300 ease-in-out h-full">                                                                                                                                                                                                                                                                                                                    
            
            
            
            
            </div>}
    </>
    */
}