import { useSearchParams } from "next/navigation";
import { PiBookOpenFill, PiBookOpenLight, PiMapTrifold, PiMapTrifoldFill, PiMapTrifoldLight, PiTableFill, PiTableLight } from "react-icons/pi";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { useContext } from "react";
import { GlobalContext } from "@/app/global-provider";
import { usePerspective, useMode } from "@/lib/search-params";
import { contentSettings } from "@/config/server-config";
import useDocData from "@/state/hooks/doc-data";

export default function ModeSelector() {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const perspective = usePerspective()
    const mode = useMode()
    const { setPreferredTab, isMobile } = useContext(GlobalContext)
    const {docDataset} = useDocData()
    const group = searchParams.get('group')

    return <div className={`inline-flex tabs ${mode == 'map' ? 'rounded-br-md lg:rounded-md shadow-lg bg-white' : ''} ${isMobile ? 'pl-2 pt-2 pr-1 pb-1' : ' p-2 gap-1'}`} role="tablist">
            {contentSettings[perspective]?.display == 'map' && <ClickableIcon aria-selected={mode == 'map' ? true : false}
                      onClick={() => {
                        setPreferredTab(perspective, 'map')
                      }}
                      role="tab"
                      label="Kart"
                      remove={['mode']}
                      add={{...mode != 'map' && group && !doc ? {details: 'group'} : {}, ...mode != 'map' && doc ? {details: 'doc'} : {}}}
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2">
                        { mode == 'map' ? <PiMapTrifoldFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiMapTrifoldLight className="text-3xl text-neutral-900" aria-hidden="true"/>}

            </ClickableIcon>}

            <ClickableIcon add={{mode: 'table'}} 
                        onClick={() => {
                            setPreferredTab(perspective, 'table')
                        }}
                        role="tab"
                        label="Tabell"
                        aria-selected={mode == 'table' ? true : false}
                        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2">
                            {mode == 'table' ? <PiTableFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiTableLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
            </ClickableIcon>

            <ClickableIcon add={{mode: 'list'}} 
                        onClick={() => {
                            setPreferredTab(perspective, 'list')
                        }}
                        role="tab"
                        label="Oppslag"
                        aria-selected={mode == 'list' ? true : false}
                        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-auto p-1 px-2">
                            {mode == 'list' ? <PiBookOpenFill className="text-3xl text-accent-800" aria-hidden="true"/>  : <PiBookOpenLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
            </ClickableIcon>

        </div>
    
}

