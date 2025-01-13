import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiList, PiListBold, PiListFill, PiListThin, PiMapTrifold, PiMapTrifoldFill, PiRows, PiRowsFill, PiTable, PiTableFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import ClickableIcon from "../ui/clickable/clickable-icon";

export default function ModeSelector() {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const searchParams = useSearchParams()

    return <nav className={`flex ${mode == 'map' ? 'rounded-md shadow-md bg-white' : ''}`}>
            <ClickableIcon aria-current={mode == 'map' ? 'page' : false}
                      label="Kart"
                      remove={['mode']}
                      className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 text-neutral-950 aria-[current=page]:shadow-inner">
                        { mode == 'map' ? <PiMapTrifoldFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiMapTrifold className="text-2xl xl:text-xl" aria-hidden="true"/>}

            </ClickableIcon>


            <ClickableIcon add={{mode: 'table', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        label="Tabell"
                        aria-current={mode == 'table' ? 'page' : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 text-neutral-950 aria-[current=page]:shadow-inner">
                            {mode == 'table' ? <PiTableFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiTable className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>

            <ClickableIcon add={{mode: 'list', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        label="Liste"
                        aria-current={mode == 'list' ? 'page' : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 text-neutral-950 aria-[current=page]:shadow-inner">
                            {mode == 'list' ? <PiRowsFill className="text-2xl xl:text-xl" aria-hidden="true"/>  : <PiRows className="text-2xl xl:text-xl" aria-hidden="true"/>}
            </ClickableIcon>







        </nav>
    
}


