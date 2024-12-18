'use client'
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import DocInfo from "./doc-info"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs"
import Link from "next/link"
import { DocContext } from "@/app/doc-provider"
import { getSkeletonLength } from "@/lib/utils"
import ParamLink from "@/components/ui/param-link"


export default function InfoContent() {

    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const parent = searchParams.get('parent')
    const { docData, sameMarkerList} = useContext(DocContext)
    


    const serialize = createSerializer({
        doc: parseAsString,
        dataset: parseAsString,
    })

    return <>

    {docData?._source && <DocInfo/> }

    {(sameMarkerList?.length && doc != parent) ?
        
    
    <div className="instance-info !pt-4 mt-4 pb-4 border-t border-t-neutral-200">

    
        <h2 className="!text-lg font-semibold uppercase !font-sans">Alle treff på koordinatet</h2>
        
        <nav className="flex md:flex-wrap w-full flex-col md:flex-row gap-2 mt-2">
        { sameMarkerList?.reverse().map((hit: any, index: number) => {
        return <ParamLink key={hit._id} role="tab" aria-selected={[hit.fields?.uuid[0], hit.fields?.children?.[0]].includes(doc)} className="rounded-tabs" add={{doc: hit.fields.children?.length == 1 ? hit.fields.children[0] : hit.fields.uuid[0]}}>
            {hit.fields.label}
        </ParamLink>
        }
        )}
        </nav>

        </div>
        : null

    }

    </>
    
}