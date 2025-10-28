'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import IconButton from "@/components/ui/icon-button";
import { facetConfig } from "@/config/search-config";
import { usePerspective } from "@/lib/param-hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext } from "react";
import { PiFunnelSimple, PiSortDescending, PiSortAscending, PiTrash } from "react-icons/pi";
import { usePreferences } from "@/state/zustand/persistent-preferences";

export default function FacetToolbar() {
    const perspective = usePerspective()
    const {facetOptions, updateFacetOption } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'
    const router = useRouter()

    const facetSort = usePreferences((state) => state.facetSort)
    const setFacetSort = usePreferences((state) => state.setFacetSort)

    const currentFacet = facet || facetConfig[perspective][0]?.key

    const sortMode = facetSort[currentFacet] || facetOptions[perspective]?.[currentFacet]?.sort
    

    


    return (
        <div className="flex items-center text-neutral-950 gap-2">

        {false && <>{sortMode == 'doc_count' ?
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter stigende" onClick={() => setFacetSort(currentFacet, 'asc')}><PiSortAscending/></IconButton>
            : sortMode == 'asc' ?
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter synkende" onClick={() => setFacetSort(currentFacet, 'desc')}><PiSortDescending/></IconButton>
            :
            <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter etter antall treff" onClick={() => setFacetSort(currentFacet, 'doc_count')}><PiFunnelSimple/></IconButton>
            }</>}


        <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Nullstill filter" onClick={() => {

            router.push(`?${new URLSearchParams(Array.from(searchParams.entries()).filter(([key, value]) => key != currentFacet))}`)
        }}>
            <PiTrash/>
        </IconButton>
        </div>
    )

}

