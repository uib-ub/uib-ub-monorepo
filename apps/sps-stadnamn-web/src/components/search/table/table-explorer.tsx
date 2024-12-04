import SearchLink from "@/components/ui/search-link"
import { treeSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { usePathname, useSearchParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { PiDatabase, PiList, PiMapTrifold, PiTable, PiTreeView } from "react-icons/pi"

export default function TableExplorer() {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const pathname = usePathname()
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const expanded = useQueryState('expanded')[0]

    return (
        <div className="w-[100svw]">
        <div className="!w-[25svw] flex">
       <nav className="bg-white shadow-md flex text-xl p-1">
       <SearchLink 
               add={{expanded: 'datasets'}}
               className="flex whitespace-nowrap items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                 <PiDatabase aria-hidden="true"/>
         </SearchLink>
       <SearchLink 
               add={{expanded: 'results'}}
               className="flex whitespace-nowrap items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                 <PiList aria-hidden="true"/>
         </SearchLink>

         {treeSettings[dataset] && <SearchLink add={{expanded: 'tree'}} 
             aria-current={mode == 'tree' ? 'page' : false}
             onClick={() => { localStorage?.setItem(mode + 'Query', searchParams.toString()) }}
             className="flex whitespace-nowrap items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                 <PiTreeView aria-hidden="true"/></SearchLink>}





 </nav>
 </div>
 </div>
    )
}