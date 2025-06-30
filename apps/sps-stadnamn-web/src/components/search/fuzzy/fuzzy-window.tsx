import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars, PiArchiveLight, PiBinocularsFill, PiArrowElbowUpLeft, PiArrowElbowLeftUp, PiListBullets, PiListBulletsLight, PiCaretLeftBold, PiXBold, PiMapPinLight, PiArrowLeft, PiClockThin, PiTextAaThin, PiClockFill, PiClockLight, PiTextAaLight, PiTextAaFill, PiTag, PiTagFill, PiTagLight, PiListBulletsFill } from "react-icons/pi"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { DocContext } from "@/app/doc-provider"
import { useMode } from "@/lib/search-params"
import { GroupContext } from "@/app/group-provider"

import { GlobalContext } from "@/app/global-provider"
import DocInfo from "../details/doc/doc-info"
import FuzzyExplorer from "./fuzzy-explorer"
import Clickable from "@/components/ui/clickable/clickable"
import InfoPopover from "@/components/ui/info-popover"

export default function FuzzyWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const mode = useMode()
    

    return <>
    <div className={`flex p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
        <h2 className="text-neutral-900 text-xl self-center flex items-center px-2">Finn namneformer<InfoPopover>
        Få oversikt over liknande oppslag i nærområdet. Treffa er ikkje nødvendigvis former av namnet du har valt, og det kan vere namnformer som ikkje er tekne med.
        </InfoPopover></h2>

        

    <ClickableIcon
            label="Lukk"
            remove={["fuzzyNav"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>

  


    <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <FuzzyExplorer/>
    </div>



</>
}







