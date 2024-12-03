import { treeSettings } from "@/config/server-config";
import { useDataset } from "@/lib/search-params";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiCaretRight, PiDatabase, PiMagnifyingGlass, PiMapTrifold, PiTable, PiTreeView } from "react-icons/pi";
import SearchLink from "../ui/search-link";

export default function ModeSelector() {
    const searchParams = useSearchParams()
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const expanded = useQueryState('expanded')[0]
    const pathname = usePathname()
    const dataset = useDataset()

    return <nav className="bg-white rounded-md shadow-md flex mt-2">
              <SearchLink aria-current={(pathname == '/search' && mode == 'map') ? 'page' : false}
                      remove={['mode']}
                      className="flex whitespace-nowrap items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiMapTrifold aria-hidden="true"/>Kart
                </SearchLink>

                {treeSettings[dataset] && <SearchLink add={{mode: 'tree'}} 
                    aria-current={mode == 'tree' ? 'page' : false}
                    onClick={() => { localStorage?.setItem(mode + 'Query', searchParams.toString()) }}
                    className="flex whitespace-nowrap items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiTreeView aria-hidden="true"/>Register</SearchLink>}

            <SearchLink add={{mode: 'table'}} className="flex whitespace-nowrap grow items-center gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200"><PiTable aria-hidden="true"/>Tabell</SearchLink>



        </nav>
    
}


