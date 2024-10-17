import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import DatasetInfo from "./DatasetInfo"
import DocInfo from "./DocInfo"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import { useSearchQuery } from "@/lib/search-params"
import Link from "next/link"
import { PiCaretLeft, PiCaretRight } from "react-icons/pi"


export default function InfoContent({expanded, selectedDocState}: {expanded: boolean, selectedDocState: any}) {

    const searchParams = useSearchParams()
    const doc = useQueryState('doc')[0]
    const dataset = searchParams.get('dataset')
    const point = useQueryState('point')[0]
    const { searchQueryString } = useSearchQuery()
    const [ docSource, setDocSource ] = useState<any | null>(null)
    const [ docList, setDocList ] = useState<any[] | null>(null)
    const [ docDataset, setDocDataset ] = useState<string | null>(null)
    const [listOffset, setListOffset] = useState(0)

    const [isLoading, setIsLoading] = useState(true)

    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
        point: parseAsArrayOf(parseAsFloat, ','),
    })
    

    useEffect(() => {
        setIsLoading(true)
        
       
        if (doc) {
            fetch(`/api/doc?uuid=${doc}&dataset=${dataset || 'search'}`).then(res => res.json()).then(data => {
                console.log(data)
                if (data.hits?.hits?.length) {
                    setDocSource(data.hits?.hits[0]._source)
                    setDocDataset(data.hits?.hits[0]._index.split("-")[2])
                    setIsLoading(false)
                }
            })
        }
        else {
            setDocSource(null)
            setDocDataset(null)
            setIsLoading(false)
        }
        if (point) {
            fetch(`/api/location?point=${point}&dataset=${dataset || 'search'}&${searchQueryString}`).then(res => 
                res.json()).then(data => {
                    console.log(data)
                    if (data.hits?.hits?.length) {
                        setDocList(data.hits?.hits)
                        setIsLoading(false)
                    }
            })
        }
        else {
            setDocList(null)
            setIsLoading(false)
        }

        setListOffset(0)
            
    }
    , [doc, point, dataset, searchQueryString])

    
    
    
    
    

    if (docSource && doc && docDataset) {
        return <>
        {docList?.length && <nav className="flex flex-wrap gap-2 mb-8"> 
            {listOffset > 0 && <button className="bg-primary-600 rounded-full px-1 text-white"  onClick={() => setListOffset(listOffset - 6)}><PiCaretLeft/></button>}
            
            {
            docList.slice(listOffset, listOffset + 6).map((hit: any) => {
                return <Link key={hit._id} className="px-4 bg-neutral-100 rounded-full  no-underline whitespace-nowrap" href={serialize({doc: hit._id, point: hit._source.location?.coordinates?.toReversed(),
                     dataset: hit._index.split("-")[2]})}
                          aria-current>
                        {hit._source.label}
                    </Link>
            })
            }
            {docList.length > listOffset + 6 && <button className="bg-primary-600 rounded-full min-h-6 px-1 text-white ml-auto"  onClick={() => setListOffset(listOffset + 6)}><PiCaretRight/></button>}
            </nav>
        }
        <DocInfo docSource={docSource} docDataset={docDataset}/>
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