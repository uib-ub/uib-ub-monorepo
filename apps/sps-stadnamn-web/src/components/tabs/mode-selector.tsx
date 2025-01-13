import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiList, PiListBold, PiListFill, PiListThin, PiMapTrifold, PiMapTrifoldFill, PiRows, PiRowsFill, PiTable, PiTableFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import ClickableIcon from "../ui/clickable/clickable-icon";

export default function ModeSelector() {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const searchParams = useSearchParams()

    return <div className={`flex ${mode == 'map' ? 'rounded-md shadow-md bg-white' : ''}`} role="tablist">
            <ClickableIcon aria-selected={mode == 'map' ? true : false}
                      role="tab"
                      label="Kart"
                      remove={['mode']}
                      className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                        { mode == 'map' ? <PiMapTrifoldFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiMapTrifold className="text-2xl xl:text-xl" aria-hidden="true"/>}

            </ClickableIcon>

            <ClickableIcon add={{mode: 'table', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        role="tab"
                        label="Tabell"
                        aria-selected={mode == 'table' ? true : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                            {mode == 'table' ? <PiTableFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiTable className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>

            <ClickableIcon add={{mode: 'list', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        role="tab"
                        label="Liste"
                        aria-selected={mode == 'list' ? true : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-selected:bg-neutral-100 text-neutral-950 aria-selected:shadow-inner">
                            {mode == 'list' ? <PiRowsFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiRows className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>
        </div>
    
}


