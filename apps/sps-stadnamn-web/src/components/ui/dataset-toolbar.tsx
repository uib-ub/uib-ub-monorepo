import { treeSettings } from "@/config/server-config";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiCaretRight, PiMagnifyingGlass, PiTable, PiTreeView } from "react-icons/pi";

export default function DatasetToolbar({ dataset }: { dataset: string }) {
    const searchParams = useSearchParams()
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const pathname = usePathname()

    return <nav className="mt-auto flex gap-2">
              <Link aria-current={(pathname == '/search' && mode == 'map') ? 'page' : false}
                      href={`/search?dataset=${dataset}`} 
                      className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiMagnifyingGlass aria-hidden="true"/> Søk
                </Link>

                {treeSettings[dataset] && <Link href={`/search?dataset=${dataset}&mode=tree`} 
                    aria-current={mode == 'tree' ? 'page' : false}
                    onClick={() => {
                                    // set current url as storedSearchQuery in localstorage
                                    localStorage?.setItem('storedSearchQuery', searchParams.toString())
                                }}
                    className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiTreeView aria-hidden="true"/> Register</Link>}

            <Link href={`/info/datasets/${dataset}`} className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200"><PiTable aria-hidden="true"/>Tabell</Link>


            <Link href={`/info/datasets/${dataset}`} className="flex whitespace-nowrap items-center gap-1 no-underline lg:ml-auto bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2">Les mer<PiCaretRight className="text-primary-600" aria-hidden="true"/></Link>

        </nav>
    
}


