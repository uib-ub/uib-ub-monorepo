import { GlobalContext } from "@/app/global-provider";
import { SearchContext } from "@/app/search-provider";
import IconButton from "@/components/ui/icon-button";
import { facetConfig } from "@/config/search-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { PiFunnelSimple, PiPushPin, PiPushPinFill, PiPushPinSlash, PiSortDescending, PiTrashFill, PiPushPinSlashFill, PiSortAscendingLight, PiSortAscending, PiTrash } from "react-icons/pi";

export default function FacetToolbar() {
    const dataset = useDataset()
    const {facetOptions, updateFacetOption} = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'
    const {setPinnedFilters} = useContext(GlobalContext)
    const {facetFilters} = useSearchQuery()
    const router = useRouter()

    const currentFacet = facet || facetConfig[dataset][0]?.key

    const pinned = facetOptions[`${dataset}:${currentFacet}`]?.isPinned
    const sortMode = facetOptions[`${dataset}:${currentFacet}`]?.sort
    


    return (
        <div className="flex items-center text-neutral-950">

        {sortMode == 'doc_count' ?
            <IconButton className="text-xl p-1" label="Sorter stigende" onClick={() => updateFacetOption(currentFacet, {sort: 'asc'})}><PiSortAscending/></IconButton>
            : sortMode == 'asc' ?
            <IconButton className="text-xl p-1" label="Sorter synkende" onClick={() => updateFacetOption(currentFacet, {sort: 'desc'})}><PiSortDescending/></IconButton>
            :
            <IconButton className="text-xl p-1" label="Sorter etter antall treff" onClick={() => updateFacetOption(currentFacet, {sort: 'doc_count'})}><PiFunnelSimple/></IconButton>
            }


        <IconButton className="text-xl p-1" label={pinned ? "Ikke behold filtrering" : "Behold til senere"} onClick={() => {
            updateFacetOption(currentFacet, {isPinned: !pinned})
            setPinnedFilters(facetFilters.filter(([key, value]) => key == currentFacet ? !pinned : facetOptions[`${dataset}:${key}`]?.isPinned))
        }}>
            {pinned ? <PiPushPinSlash/> : <PiPushPin/>}
        </IconButton>
        <IconButton className="text-xl p-1" label="Nullstill filter" onClick={() => {

            router.push(`?${new URLSearchParams(Array.from(searchParams.entries()).filter(([key, value]) => key != currentFacet))}`)
        }}>
            <PiTrash/>
        </IconButton>
        </div>
    )

}

