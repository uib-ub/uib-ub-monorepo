import { GroupContext } from "@/app/group-provider";
import Clickable from "@/components/ui/clickable/clickable";
import { useSearchParams } from "next/navigation";
import { useContext } from "react";
import { PiBookOpenFill, PiBookOpenLight, PiListLight } from "react-icons/pi";


export default function DetailsTabs() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const { groupData, groupTotal } = useContext(GroupContext)
    return <>
    <Clickable
        label="Oppslag"
        add={{details: "doc"}} 
        aria-selected={details == "doc" || (details == "group" &&  !groupData)}
        className="flex h-10 whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        {details == "doc" ? <PiBookOpenFill className="text-accent-800" aria-hidden="true"/> : <PiBookOpenLight className="text-accent-900" aria-hidden="true"/>}
        <span className="text-neutral-900 sr-only 2xl:not-sr-only whitespace-nowrap">Oppslag</span>
    </Clickable>

    { groupTotal?.value && groupTotal.value > 1 && <Clickable label="Oversikt" 
          remove={["details", "fuzzyNav"]} 
          add={{details: "group"}}
          aria-selected={details == "group"}
          className="flex whitespace-nowrap group relative items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 px-3 aria-selected:bg-neutral-100 aria-selected:text-neutral-900 aria-selected:shadow-inner">
      <PiListLight className="text-neutral-900 xl:sr-only" aria-hidden="true"/>
      <span className="text-neutral-900 hidden xl:flex flex-nowrap whitespace-nowrap">Oversikt</span>
      {groupTotal?.value && groupTotal.value > 0 && (
        <span className={`results-badge bg-primary-200 ${groupTotal.value > 9 ? 'px-1.5': 'px-2'} text-primary-700 font-bold group-aria-selected:bg-accent-800 group-aria-selected:text-white left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap`}>
          {groupTotal.value}
        </span>
      )}
    </Clickable>}
    </>
}