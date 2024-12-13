'use client'
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import DocInfo from "./doc-info"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import Link from "next/link"
import { DocContext } from "@/app/doc-provider"
import { getSkeletonLength } from "@/lib/utils"


export default function InfoContent() {

    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc', { history: 'push'})
    const point = searchParams.get('point')
    const { docLoading, docData, docList} = useContext(DocContext)
    


    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
        point: parseAsArrayOf(parseAsFloat, ','),
    })




    if (point || doc) {
        return <>
        {docLoading &&
        <div className="w-full h-full flex justify-start flex flex-col gap-4 pt-1 pb-2">
            <div className="h-8 w-32 bg-neutral-200 rounded-full animate-pulse"></div>
            <div className="flex gap-2 pb-2">
                <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
                <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>
            {Array.from({length: 4}).map((_, index) => {
                return <div key={index} style={{width: getSkeletonLength(index, 10, 20) + 'rem' }} className="h-4 bg-neutral-200 rounded-full animate-pulse"></div>
            })}
            <div className="flex gap-2 pt-4">
                <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
            </div>


        </div>
        
        }
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