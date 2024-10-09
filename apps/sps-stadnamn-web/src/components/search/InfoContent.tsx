import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./DatasetInfo"
import DocInfo from "./DocInfo"


export default function InfoContent({expanded}: {expanded: boolean}) {

    const searchParams = useSearchParams()
    const router = useRouter()
    const [selected, setSelected] = useState<any[] | null>(null)
    const doc = searchParams.get('doc')
    const dataset = searchParams.get('dataset') || 'search'
    const point = searchParams.get('point')
    

    useEffect(() => {
        console.log("RUNNING")
        
       
        if (doc) {

            fetch(`/api/doc?uuid=${doc}&dataset=${dataset}`).then(res => res.json()).then(data => {
                console.log(data)
                if (data.hits?.hits?.length) {
                    setSelected(data.hits?.hits)
                }
            })

        }
        else if (point) {

            fetch(`/api/doc?location=${point}&dataset=${dataset}`).then(res => 
                res.json()).then(data => {
                    console.log(data)
                    if (data.hits?.hits?.length) {
                        setSelected(data.hits?.hits)
                    }
            })
        }
        else {
            setSelected(null)
        }
            
    }
    , [doc, point, dataset])

    
    
    if (!selected) {
        return <DatasetInfo/>
    }

    if (selected.length == 1) {
        return <DocInfo doc={selected[0]}/>
    }
    if (selected.length > 1) {
        return <article className="p-0">{
            selected.map((hit: any) => {
                return <div key={hit._id} className="p-0">
                    <h2>{hit._source?.label}</h2>
                </div>
            })
        }</article>
    }


/*

    <button onClick={() => router.push("/search")}>TEST</button>
            { expanded && <div className="transition-all duration-300 ease-in-out h-full">                                                                                                                                                                                                                                                                                                                    
            
            
            
            
            </div>}
    </>
    */
}