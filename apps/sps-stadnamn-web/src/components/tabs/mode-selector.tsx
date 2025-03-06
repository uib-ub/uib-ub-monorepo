import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiBookOpen, PiBookOpenFill, PiMapTrifold, PiMapTrifoldFill, PiRows, PiRowsFill, PiTable, PiTableFill } from "react-icons/pi";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { useContext } from "react";
import { GlobalContext } from "@/app/global-provider";
import { useDataset } from "@/lib/search-params";

export default function ModeSelector() {
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') || 'map'
    const doc = searchParams.get('doc')
    const dataset = useDataset()
    const { isMobile, setPreferredTab } = useContext(GlobalContext)

    return <div className={`flex ${mode == 'map' ? 'rounded-br-md lg:rounded-md shadow-lg bg-white' : ''}`} role="tablist">
            <ClickableIcon aria-selected={mode == 'map' ? true : false}
                      onClick={() => {
                        setPreferredTab(dataset, 'map')
                      }}
                      role="tab"
                      label="Kart"
                      remove={['mode']}
                      className="flex  m-1 h-8 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                        { mode == 'map' ? <PiMapTrifoldFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiMapTrifold className="text-2xl xl:text-xl" aria-hidden="true"/>}

            </ClickableIcon>

            <ClickableIcon add={{mode: 'table', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        onClick={() => {
                            setPreferredTab(dataset, 'table')
                        }}
                        role="tab"
                        label="Tabell"
                        aria-selected={mode == 'table' ? true : false}
                        className="flex  m-1 h-8 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                            {mode == 'table' ? <PiTableFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiTable className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>

            <ClickableIcon add={{mode: 'list', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        onClick={() => {
                            setPreferredTab(dataset, 'list')
                        }}
                        role="tab"
                        label="Liste"
                        aria-selected={mode == 'list' ? true : false}
                        className="flex  m-1 h-8 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                            {mode == 'list' ? <PiRowsFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiRows className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>
            { mode != 'map' && doc && <ClickableIcon add={{mode: 'doc'}} 
                        role="tab"
                        label="Dokument"
                        aria-selected={mode == 'doc' ? true : false}
                        className="flex  m-1 h-8 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                            {mode == 'doc' ? <PiBookOpenFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiBookOpen className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>}

        </div>
    
}


