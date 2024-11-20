import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./dataset-info"
import DocInfo from "./doc-info"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import Link from "next/link"
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from "react-icons/pi"


export default function InfoContent({expanded, selectedDocState}: {expanded: boolean, selectedDocState: any}) {

    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const point = useQueryState('point')[0]
    const dataset = useDataset()
    const { searchQueryString } = useSearchQuery()
    const [ docList, setDocList ] = useState<any[] | null>(null)
    const [listOffset, setListOffset] = useState(0)
    const [selectedDoc, setSelectedDoc] = selectedDocState

    const [isLoading, setIsLoading] = useState(true)

    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
        point: parseAsArrayOf(parseAsFloat, ','),
    })


    useEffect(() => {
        if (doc) {
            setIsLoading(true)
            fetch(`/api/doc?uuid=${doc}${dataset != 'search' && dataset ? '&dataset=' + dataset : ''}`).then(res => res.json()).then(data => {
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
                    }
            })
        }
        else {
            setDocList(null)
        }
    }, [point, dataset, searchQueryString])

    useEffect(() => {
        setListOffset(0)
    }
    , [point])

    

    if (point || doc) {
        return <>
        {selectedDoc?._source && <DocInfo selectedDoc={selectedDoc}/> }

        {docList?.length && 
            
        
        <div className="instance-info !pt-4 mt-4 pb-4 border-t border-t-neutral-200">
            <h2 className="!text-lg font-semibold uppercase !font-sans">Alle treff på koordinatet</h2>
            <nav className="flex md:flex-wrap w-full flex-col md:flex-row gap-2 mt-2">
            { docList?.map((hit: any, index: number) => {
            return <Link key={hit._id} aria-current={doc == hit.fields.uuid[0] ? 'page' : false} className="flex flex-wrap chip gap-2 p-1 px-4 bg-neutral-100 rounded-full no-underline aria-[current=page]:text-white aria-[current=page]:bg-accent-800" href={serialize(new URLSearchParams(searchParams), {doc: hit.fields.uuid[0]})}>
                {hit.fields.label}
            </Link>
            }
            )}
            </nav>
            </div>

 
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