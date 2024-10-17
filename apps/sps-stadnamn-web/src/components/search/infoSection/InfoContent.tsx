import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./DatasetInfo"
import DocInfo from "./DocInfo"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import { useSearchQuery } from "@/lib/search-params"
import Link from "next/link"
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from "react-icons/pi"


export default function InfoContent({expanded, selectedDocState, markerCountState}: {expanded: boolean, selectedDocState: any, markerCountState: any}) {

    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const dataset = searchParams.get('dataset')
    const point = useQueryState('point')[0]
    const { searchQueryString } = useSearchQuery()
    const [ docList, setDocList ] = useState<any[] | null>(null)
    const [listOffset, setListOffset] = useState(0)
    const [selectedDoc, setSelectedDoc] = selectedDocState
    const [markerCount, setMarkerCount] = markerCountState

    const [isLoading, setIsLoading] = useState(true)

    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
        point: parseAsArrayOf(parseAsFloat, ','),
    })

    useEffect(() => {
        console.log("DOC", doc)
        console.log("ID", selectedDoc?._id)
    }   
    , [doc, selectedDoc])
    

    useEffect(() => {
        if (doc) {
            setIsLoading(true)
            console.log("SETTING DOC")
            fetch(`/api/doc?uuid=${doc}&dataset=${dataset || 'search'}`).then(res => res.json()).then(data => {
                console.log("FETCH DONE", data.hits?.hits?.length)
                if (data.hits?.hits?.length) {
                    setSelectedDoc(data.hits.hits[0])
                    setIsLoading(false)
                }
            })
        }
        else {
            setSelectedDoc(null)
            setIsLoading(false)
        }
    }   
    , [doc, dataset, setSelectedDoc])

    useEffect(() => {
        if (point) {
            fetch(`/api/location?point=${point}&dataset=${dataset || 'search'}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    if (data.hits?.hits?.length) {
                        setDocList(data.hits?.hits)
                        setIsLoading(false)
                        setMarkerCount(data.hits?.total?.value)
                    }
            })
        }
        else {
            setDocList(null)
        }
    }, [point, dataset, searchQueryString, setMarkerCount])

    useEffect(() => {
        setListOffset(0)
    }
    , [point])

    

    if (point || doc) {
        return <>
    
        {docList?.length ? <ul className="list-none">
            { docList?.map((hit: any, index: number) => {
            return <li key={hit._id} className="mb-4">
            <button className="flex items-center gap-2 bg-neutral-50 w-full p-2 px-4" aria-controls={hit._id + "_details"} onClick={() => setDoc(prevDoc => prevDoc == hit.fields.uuid ? null : hit.fields.uuid )}>
                {
                    hit.fields.uuid == doc ? <PiCaretUp/> : <PiCaretDown/>
                }
                {index+1}: {hit.fields.label}
            </button>
            <div id={hit._id + "_details"} className={hit.fields.uuid == doc ? 'pt-4' : 'hidden'}>
                
                {!isLoading && hit.fields.uuid == doc && selectedDoc?._source && <DocInfo selectedDoc={selectedDoc}/>}
                </div>
                </li>
            }
            )}
            </ul>
        :
        selectedDoc?._source && <DocInfo selectedDoc={selectedDoc}/> 
 
        }
        </>
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