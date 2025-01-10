import { treeSettings } from "@/config/server-config";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiCaretRight, PiMagnifyingGlass, PiWall } from "react-icons/pi";
import { datasetPresentation, datasetTitles } from "@/config/metadata-config";
import { GlobalContext } from "@/app/global-provider";
import { useContext } from "react";

const icons: {[key: string]: JSX.Element} ={
    "base": <PiWall className="text-neutral-800" aria-hidden="true"/>,
  };

export default function DatasetToolbar({ dataset }: { dataset: string }) {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const pathname = usePathname()
    const { pinnedFilters } = useContext(GlobalContext)

    return <nav className="mt-auto flex flex-col md:flex-row gap-2">
              <Link aria-current={(pathname == '/search' && mode == 'map') ? 'page' : false}
                      href={`/search?dataset=${dataset}${pinnedFilters[dataset] ? `&${new URLSearchParams(pinnedFilters[dataset]).toString()}` : ''}`} 
                      className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-50 border border-neutral-200 rounded-md w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiMagnifyingGlass aria-hidden="true"/> Søkevisning
                </Link>
                {Object.entries(datasetPresentation[dataset]?.subindices || {}).map(([key, value]) => (
                    <Link key={key} href={`/search?dataset=${key}&mode=list${pinnedFilters[dataset] ? `&${new URLSearchParams(pinnedFilters[dataset]).toString()}` : ''}`} 
                    className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-50 border border-neutral-200 rounded-md w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        {icons[value.icon]} {datasetTitles[key][0].toUpperCase() + datasetTitles[key].slice(1)}
                    </Link>
                ))}
                


            <Link href={`/info/datasets/${dataset}`} className="flex whitespace-nowrap items-center rounded-md gap-1 no-underline bg-neutral-50 border border-neutral-200 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2">Les mer<PiCaretRight className="text-primary-600" aria-hidden="true"/></Link>

        </nav>
    
}


