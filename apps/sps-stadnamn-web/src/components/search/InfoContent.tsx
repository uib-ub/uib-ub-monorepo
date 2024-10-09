import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export default function InfoContent({expanded}: {expanded: boolean}) {

    const searchParams = useSearchParams()
    const router = useRouter()
    const [info, setInfo] = useState<any[] | null>(null)
    const doc = searchParams.get('doc')
    const dataset = searchParams.get('dataset') || 'search'
    const point = searchParams.get('point')
    

    useEffect(() => {
        console.log("RUNNING")
        
       
        if (doc) {

            fetch(`/api/doc?uuid=${doc}&dataset=${dataset}`).then(res => res.json()).then(data => {
                console.log(data)
                if (data.hits?.hits?.length) {
                    setInfo(data.hits?.hits)
                }
            })

        }
        else if (point) {

            fetch(`/api/doc?location=${point}&dataset=${dataset}`).then(res => 
                res.json()).then(data => {
                    console.log(data)
                    if (data.hits?.hits?.length) {
                        setInfo(data.hits?.hits)
                    }
            })
        }
            
    }
    , [doc, point, dataset])

    
    
    if (!info) {
        return <div className="p-4">Ingen informasjon</div>
    }

    if (info.length == 0) {
        return <div className="p-4">Ingen treff</div>
    }
    if (info.length == 1) {
        return <article className="p-4"><h1>{info[0]._source.label}</h1></article>
    }
    if (info.length > 1) {
        return <div className="p-4">{
            info.map((hit: any) => {
                return <div key={hit._id} className="p-4">
                    <h2>{hit._source?.label}</h2>
                </div>
            })
        }</div>
    }


/*

    <button onClick={() => router.push("/search")}>TEST</button>
            { expanded && <div className="transition-all duration-300 ease-in-out h-full">                                                                                                                                                                                                                                                                                                                    
            
            
            
            
            </div>}
    </>
    */
}