import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars, PiArchiveLight, PiBinocularsFill, PiArrowElbowUpLeft, PiArrowElbowLeftUp, PiListBullets, PiListBulletsLight, PiCaretLeftBold, PiXBold, PiMapPinLight, PiArrowLeft } from "react-icons/pi"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { DocContext } from "@/app/doc-provider"
import { useMode } from "@/lib/search-params"
import { GroupContext } from "@/app/group-provider"

import { GlobalContext } from "@/app/global-provider"
import DocInfo from "../details/doc/doc-info"
import FuzzyExplorer from "../details/fuzzy/fuzzy-explorer"

export default function ParentWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const doc = searchParams.get('doc')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()
    const group = searchParams.get('group')
    const { prevDocUrl, setPrevDocUrl } = useContext(GlobalContext)

    const { groupData, groupLoading, groupTotal } = useContext(GroupContext)
    

    return <>
    <div className={`flex p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>


  
        
    <ClickableIcon
            label="Lukk"
            remove={["parent"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>

  


    <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <FuzzyExplorer/>
    </div>



</>
}







