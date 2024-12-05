'use client'
import { useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import DatasetInfo from "./dataset-info"
import DocInfo from "./doc-info"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import Link from "next/link"
import { PiCaretDown, PiCaretLeft, PiCaretRight, PiCaretUp } from "react-icons/pi"
import { DocContext } from "@/app/doc-provider"
import Spinner from "@/components/svg/Spinner"


export default function InfoContent() {

    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const point = useQueryState('point')[0]
    const dataset = useDataset()
    const { searchQueryString, searchFilterParamsString } = useSearchQuery()
    const [listOffset, setListOffset] = useState(0)
    const { docLoading, docData, docList} = useContext(DocContext)

    const [isLoading, setIsLoading] = useState(true)

    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
        point: parseAsArrayOf(parseAsFloat, ','),
    })




    if (point || doc) {
        return <>
        {!docLoading && docData?._source && <DocInfo/> }

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
}