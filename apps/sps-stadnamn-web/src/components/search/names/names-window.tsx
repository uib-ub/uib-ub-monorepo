import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiX } from "react-icons/pi"
import { useSearchParams } from "next/navigation"
import { useMode } from '@/lib/param-hooks';
import NamesExplorer from "./names-explorer"
import InfoPopover from "@/components/ui/info-popover"

export default function FuzzyWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const mode = useMode()
    

    return <>
    <div className={`flex p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
        <h2 className="text-neutral-900 text-xl self-center flex items-center px-2">Namneformer<InfoPopover>
        Få oversikt over liknande oppslag i nærområdet. Treffa er ikkje nødvendigvis former av namnet du har valt, og det kan vere namnformer som ikkje kjem med.
        </InfoPopover></h2>


    <ClickableIcon
            label="Lukk"
            remove={["namesNav"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
    

  </div>

  


    <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-7rem)] 2xl:max-h-[calc(100svh-8.5rem)] p-4 pb-8 border-neutral-200 ">
    <NamesExplorer/>
    </div>



</>
}







