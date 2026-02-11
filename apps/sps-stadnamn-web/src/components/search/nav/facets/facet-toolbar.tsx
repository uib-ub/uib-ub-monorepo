'use client'
import IconButton from "@/components/ui/icon-button";
import { facetConfig } from "@/config/search-config";
import { usePerspective } from "@/lib/param-hooks";
import { GlobalContext } from "@/state/providers/global-provider";
import { usePreferences } from "@/state/zustand/persistent-preferences";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";
import { PiFunnelSimple, PiSortAscending, PiSortDescending } from "react-icons/pi";

export default function FacetToolbar() {
    const perspective = usePerspective()
    const { facetOptions, updateFacetOption } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'
    const router = useRouter()

    const facetSort = usePreferences((state) => state.facetSort)
    const setFacetSort = usePreferences((state) => state.setFacetSort)

    const facetCountMode = usePreferences((state) => state.facetCountMode)
    const setFacetCountMode = usePreferences((state) => state.setFacetCountMode)

    const currentFacet = facet || facetConfig[perspective][0]?.key

    const sortMode = facetSort[currentFacet] || facetOptions[perspective]?.[currentFacet]?.sort

    const hasValues = searchParams.get(currentFacet)





    return (
        <div className="flex items-center text-neutral-950 gap-2 px-2">

            {false && <>{sortMode == 'doc_count' ?
                <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter stigende" onClick={() => setFacetSort(currentFacet, 'asc')}><PiSortAscending /></IconButton>
                : sortMode == 'asc' ?
                    <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter synkende" onClick={() => setFacetSort(currentFacet, 'desc')}><PiSortDescending /></IconButton>
                    :
                    <IconButton className="text-xl aspect-square btn btn-outline btn-compact h-full px-2" label="Sorter etter antall treff" onClick={() => setFacetSort(currentFacet, 'doc_count')}><PiFunnelSimple /></IconButton>
            }</>}


            {hasValues && <button className="align-text-bottom leading-none pt-1 px-1" onClick={() => {

                router.push(`?${new URLSearchParams(Array.from(searchParams.entries()).filter(([key, value]) => key != currentFacet))}`)
            }}>
                Avmerk alle
            </button>}

            <div className="ml-auto flex items-center gap-1 text-xs">
                <span className="sr-only">Vis treff som</span>
                <button
                    type="button"
                    className={`px-2 py-0.5 rounded-full border text-[0.7rem] ${
                        facetCountMode === 'absolute'
                            ? 'bg-neutral-100 text-neutral-900 border-neutral-400'
                            : 'bg-white text-neutral-700 border-neutral-300'
                        }`}
                    aria-pressed={facetCountMode === 'absolute'}
                    onClick={() => setFacetCountMode('absolute')}
                >
                    Antal
                </button>
                <button
                    type="button"
                    className={`px-2 py-0.5 rounded-full border text-[0.7rem] ${
                        facetCountMode === 'percent'
                            ? 'bg-neutral-100 text-neutral-900 border-neutral-400'
                            : 'bg-white text-neutral-700 border-neutral-300'
                        }`}
                    aria-pressed={facetCountMode === 'percent'}
                    onClick={() => setFacetCountMode('percent')}
                >
                    Prosent
                </button>
            </div>
        </div>
    )

}

