import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { PiList, PiListBold, PiListFill, PiListThin, PiMapTrifold, PiMapTrifoldFill, PiTable, PiTableFill } from "react-icons/pi";
import ParamLink from "../ui/param-link";

export default function ModeSelector() {
    const mode = useQueryState('mode', { defaultValue: 'map' })[0]
    const searchParams = useSearchParams()

    return <nav className="bg-white rounded-md shadow-md flex">
              <ParamLink aria-current={mode == 'map' ? 'page' : false}
                      remove={['mode']}
                      className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        { mode == 'map' ? <PiMapTrifoldFill aria-hidden="true"/>  : <PiMapTrifold aria-hidden="true"/>}Kart

                </ParamLink>


            <ParamLink add={{mode: 'table', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        aria-current={mode == 'table' ? 'page' : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                            {mode == 'table' ? <PiTableFill aria-hidden="true"/>  : <PiTable aria-hidden="true"/>}Tabell
            </ParamLink>

            <ParamLink add={{mode: 'list', nav: searchParams.get('nav') == 'results' ? 'filters' : searchParams.get('nav')}} 
                        aria-current={mode == 'list' ? 'page' : false}
                        className="flex  m-1 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                            {mode == 'list' ? <PiListBold aria-hidden="true"/>  : <PiListThin aria-hidden="true"/>}Liste
            </ParamLink>






        </nav>
    
}


