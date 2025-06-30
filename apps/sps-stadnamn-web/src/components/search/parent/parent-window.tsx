import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars, PiArchiveLight, PiBinocularsFill, PiArrowElbowUpLeft, PiArrowElbowLeftUp, PiListBullets, PiListBulletsLight, PiCaretLeftBold, PiXBold, PiMapPinLight, PiArrowLeft, PiClockThin, PiTextAaThin, PiClockFill, PiClockLight, PiTextAaLight, PiTextAaFill, PiTag, PiTagFill, PiTagLight, PiListBulletsFill } from "react-icons/pi"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { DocContext } from "@/app/doc-provider"
import { useMode } from "@/lib/search-params"
import { GroupContext } from "@/app/group-provider"

import { GlobalContext } from "@/app/global-provider"
import DocInfo from "../details/doc/doc-info"
import FuzzyExplorer from "../details/fuzzy/fuzzy-explorer"
import Clickable from "@/components/ui/clickable/clickable"

export default function ParentWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const mode = useMode()
    const parentNav = searchParams.get('parentNav') || 'list'
    

    return <>
    <div className={`flex p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>

                <ClickableIcon
                    add={{parentNav: 'timeline'}}
                    label="Tidslinje"
                    aria-expanded={parentNav == 'timeline'}
                    className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-950 aria-expanded:shadow-inner"
                >
                    {parentNav == 'timeline' ? <PiClockFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiClockLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon>
                <ClickableIcon
                label="Liste"
                    add={{parentNav: 'list'}}
                    aria-expanded={parentNav == 'list'}
                    className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-950 aria-expanded:shadow-inner"
                >
                    {parentNav == 'list' ? <PiListBulletsFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiListBulletsLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon>




  
        
    <ClickableIcon
            label="Lukk"
            remove={["parent", "parentNav"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>

  


    <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <FuzzyExplorer/>
    </div>



</>
}







