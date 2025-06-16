import { useSearchParams } from "next/navigation";
import { PiBookOpen, PiBookOpenFill, PiBookOpenLight, PiBookOpenThin, PiMapTrifold, PiMapTrifoldFill, PiMapTrifoldLight, PiMapTrifoldThin, PiRows, PiRowsFill, PiRowsLight, PiRowsThin, PiTable, PiTableFill, PiTableLight, PiTableThin } from "react-icons/pi";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { useContext } from "react";
import { GlobalContext } from "@/app/global-provider";
import { useDataset, useMode } from "@/lib/search-params";
import { contentSettings } from "@/config/server-config";
import { DocContext } from "@/app/doc-provider";

export default function ModeSelector() {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const dataset = useDataset()
    const mode = useMode()
    const { setPreferredTab, isMobile } = useContext(GlobalContext)
    const {docDataset} = useContext(DocContext)

    return <div className={`inline-flex ${mode == 'map' ? 'rounded-br-md lg:rounded-md shadow-lg bg-white' : ''} ${isMobile ? 'pl-2 pt-2 pr-1 pb-1' : ' p-2 gap-1'}`} role="tablist">
            {contentSettings[dataset]?.display == 'map' && <ClickableIcon aria-selected={mode == 'map' ? true : false}
                      onClick={() => {
                        setPreferredTab(dataset, 'map')
                      }}
                      role="tab"
                      label="Kart"
                      remove={['mode']}
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-900 aria-selected:shadow-inner">
                        { mode == 'map' ? <PiMapTrifoldFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiMapTrifoldLight className="text-3xl text-neutral-900" aria-hidden="true"/>}

            </ClickableIcon>}

            <ClickableIcon add={{mode: 'table', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        onClick={() => {
                            setPreferredTab(dataset, 'table')
                        }}
                        role="tab"
                        label="Tabell"
                        aria-selected={mode == 'table' ? true : false}
                        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-900 aria-selected:shadow-inner">
                            {mode == 'table' ? <PiTableFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiTableLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
            </ClickableIcon>

            <ClickableIcon add={{mode: 'list', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        onClick={() => {
                            setPreferredTab(dataset, 'list')
                        }}
                        role="tab"
                        label="Liste"
                        aria-selected={mode == 'list' ? true : false}
                        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-900 aria-selected:shadow-inner">
                            {mode == 'list' ? <PiRowsFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiRowsLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
            </ClickableIcon>
            { mode != 'map' && doc && <ClickableIcon add={{mode: 'doc', docDataset: docDataset}} 
                        role="tab"
                        label="Dokument"
                        aria-selected={mode == 'doc' ? true : false}
                        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-900 aria-selected:shadow-inner">
                            {mode == 'doc' ? <PiBookOpenFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiBookOpenLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
            </ClickableIcon>}

        </div>
    
}

