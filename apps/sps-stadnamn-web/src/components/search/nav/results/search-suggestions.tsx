import Clickable from "@/components/ui/clickable/clickable"
import { useSearchQuery } from "@/lib/search-params"
import useGroupData from "@/state/hooks/group-data"
import { useSearchParams } from "next/navigation"
import { PiBroom, PiMagnifyingGlass, PiTilde, PiTrash } from "react-icons/pi"
import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"


const Suggestion = ({q}: {q: string}) => {
    return <Clickable 
    remove={['q']} add={{
        q: q
    }} className="
    cursor-pointer select-none
    flex items-center gap-2
    py-1 rounded-md">
      {q.includes("~") ? <><PiTilde className="text-lg" aria-hidden="true"/> Omtrentleg søk</> : <><PiMagnifyingGlass className="text-lg" aria-hidden="true"/> {q}</>}
    </Clickable>
}

export default function SearchSuggestions({initGroupData}: {initGroupData: any}) {
    const searchParams = useSearchParams()
    const searchQ = searchParams.get('q')
    const initLabel = initGroupData?.fields?.label?.[0]
    const { facetFilters, datasetFilters } = useSearchQuery()
    const { isMobile } = useContext(GlobalContext)

    const filterCount = Number(facetFilters.length > 0) + Number(datasetFilters.length > 0)

    if (!searchQ && !initGroupData && (filterCount === 0 || !isMobile)) return <div className="h-4"></div>;

    return (
    <div className="flex flex-wrap gap-2 p-3 px-4 text-neutral-950">
            {(!searchQ || !searchQ?.includes("~")) && <>
            {initGroupData?.label?.[0] }
            { searchQ && /^\p{L}+$/u.test(searchQ) && <Suggestion q={searchQ + "~"} /> }
            </>
            }
            { initLabel && initLabel !== searchQ && <Suggestion q={initLabel} /> }
            { searchQ && <Clickable remove={['q']} add={{q: null}} className="flex items-center gap-2 cursor-pointer select-none px-1 pr-2 py-1 rounded-md"><PiTrash className="text-lg" aria-hidden="true"/> Fjern søkeord</Clickable>}
            { filterCount > 0 && isMobile && <Clickable remove={datasetFilters.map(filter => filter[0]).concat(facetFilters.map(filter => filter[0]))} className="flex items-center gap-2 cursor-pointer select-none py-1 rounded-md"><PiTrash className="text-lg" aria-hidden="true"/> Fjern filtrering</Clickable>}

        </div>
    )
}