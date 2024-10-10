import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./DatasetInfo"
import DocInfo from "./DocInfo"
import { getSkeletonLength } from "@/lib/utils"
import { useQueryState } from "nuqs"
import Spinner from "../../svg/Spinner"
import { useSearchQuery } from "@/lib/search-params"


export default function InfoContent({expanded}: {expanded: boolean}) {

    const searchParams = useSearchParams()
    const doc = useQueryState('doc')[0]
    const dataset = searchParams.get('dataset')
    const point = useQueryState('point')[0]
    const { searchQueryString } = useSearchQuery()
    const [ selectedDoc, setSelectedDoc ] = useState<any | null>(null)
    const [ docList, setDocList ] = useState<any[] | null>(null)

    const [isLoading, setIsLoading] = useState(true)
    

    useEffect(() => {
        setIsLoading(true)
        
       
        if (doc) {

            fetch(`/api/doc?uuid=${doc}&dataset=${dataset || 'search'}`).then(res => res.json()).then(data => {
                console.log(data)
                if (data.hits?.hits?.length) {
                    setSelectedDoc(data.hits?.hits[0])
                    setDocList(null)
                    setIsLoading(false)
                }
            })

        }
        else if (point) {
            fetch(`/api/location?point=${point}&dataset=${dataset || 'search'}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    console.log(data)
                    if (data.hits?.hits?.length) {
                        setDocList(data.hits?.hits)
                        setSelectedDoc(null)
                        setIsLoading(false)
                    }
            })
        }
        else {
            setDocList(null)
            setSelectedDoc(null)
            setIsLoading(false)
        }
            
    }
    , [doc, point, dataset, searchQueryString])

    
    
    
    
    

    if (selectedDoc && doc) {
        return <DocInfo doc={selectedDoc}/>
    }
    else if (docList?.length && point) {
        return <article>{
            docList.map((hit: any) => {
                return <div key={hit._id} className="p-0">
                    <h2>{hit._source?.label}</h2>
                </div>
            })

            
        }

        </article>
    }
    else if (!isLoading) {
        return  <DatasetInfo/> 
    }


/*

    <button onClick={() => router.push("/search")}>TEST</button>
            { expanded && <div className="transition-all duration-300 ease-in-out h-full">                                                                                                                                                                                                                                                                                                                    
            
            
            
            
            </div>}
    </>
    */
}