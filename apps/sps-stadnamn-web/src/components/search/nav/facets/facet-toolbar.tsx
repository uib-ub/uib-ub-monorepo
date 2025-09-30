'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import IconButton from "@/components/ui/icon-button";
import { facetConfig } from "@/config/search-config";
import { usePerspective } from "@/lib/param-hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext } from "react";
import { PiFunnelSimple, PiSortDescending, PiSortAscending, PiTrash } from "react-icons/pi";

export default function FacetToolbar() {
    const perspective = usePerspective()
    const {facetOptions, updateFacetOption } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'
    const router = useRouter()

    const currentFacet = facet || facetConfig[perspective][0]?.key

    const sortMode = facetOptions[perspective]?.[currentFacet]?.sort
    


    return (
        <div className="flex items-center text-neutral-950 gap-2">

        {sortMode == 'doc_count' ?
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter stigende" onClick={() => updateFacetOption(currentFacet, {sort: 'asc'})}><PiSortAscending/></IconButton>
            : sortMode == 'asc' ?
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter synkende" onClick={() => updateFacetOption(currentFacet, {sort: 'desc'})}><PiSortDescending/></IconButton>
            :
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter etter antall treff" onClick={() => updateFacetOption(currentFacet, {sort: 'doc_count'})}><PiFunnelSimple/></IconButton>
            }


        <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Nullstill filter" onClick={() => {

            router.push(`?${new URLSearchParams(Array.from(searchParams.entries()).filter(([key, value]) => key != currentFacet))}`)
        }}>
            <PiTrash/>
        </IconButton>
        </div>
    )

}

