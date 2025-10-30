import Clickable from "@/components/ui/clickable/clickable"
import useGroupData from "@/state/hooks/group-data"
import { useSearchParams } from "next/navigation"
import { PiBroom, PiMagnifyingGlass } from "react-icons/pi"


const Suggestion = ({q}: {q: string}) => {
    return <Clickable 
    remove={['q']} add={{
        q: q
    }} className="
    text-neutral-950 cursor-pointer select-none
    flex items-center gap-2
    bg-neutral-100
    px-2 pr-3 py-1 rounded-full">
        <PiMagnifyingGlass className="text-lg" aria-hidden="true"/>{q.includes("~") && "Omtrentleg: "}{q}
    </Clickable>
}

export default function SearchSuggestions({initGroupData}: {initGroupData: any}) {
    const searchParams = useSearchParams()
    const searchQ = searchParams.get('q')
    const initLabel = initGroupData?.fields?.label?.[0]

    return (
    <div className="flex flex-wrap gap-2 p-3">
            {(!searchQ || !searchQ?.includes("~")) && <>
            {initGroupData?.label?.[0] }
            { searchQ && /^\p{L}+$/u.test(searchQ) && <Suggestion q={searchQ + "~"} /> }
            </>
            }
            { initLabel && initLabel !== searchQ && <Suggestion q={initLabel} /> }
            { searchQ && <Clickable remove={['q']} add={{q: null}} className="flex items-center gap-2 text-neutral-950 cursor-pointer select-none bg-neutral-100 px-2 pr-3 py-1 rounded-full"><PiBroom className="text-lg" aria-hidden="true"/> Fjern søkeord</Clickable>}

        </div>
    )
}