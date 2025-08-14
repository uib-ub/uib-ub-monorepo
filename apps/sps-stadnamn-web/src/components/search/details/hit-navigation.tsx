import { DocContext } from "@/app/doc-provider";
import { GlobalContext } from "@/app/global-provider";
import { GroupContext } from "@/app/group-provider";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeft, PiCaretLeftBold, PiCaretRight, PiCaretRightBold, PiHandSwipeLeft, PiHandSwipeLeftBold, PiHandSwipeRight, PiHandSwipeRightBold } from "react-icons/pi";


export default function HitNavigation() {
    const {groupData, groupLoading, groupTotal, prevDocUuid, nextDocUuid, docIndex} = useContext(GroupContext)
    const {isMobile} = useContext(GlobalContext)


    return <>
    {groupTotal?.value && groupTotal.value > 1 && <div className="flex h-8 xl:h-10 w-full xl:w-auto">    
      
      <ClickableIcon 
        label="Forrige (shift + venstre piltast)" 
        className={`btn btn-outline btn-compact rounded-r-none ${isMobile ? 'rounded-full bg-white' : ''}`} 
        add={{doc: prevDocUuid}}
        disabled={!prevDocUuid || docIndex === undefined || docIndex <= 0}
      >
        {isMobile ? <PiCaretDoubleLeft className="text-xl" aria-hidden="true"/> : <PiCaretLeftBold className="xl:text-xl text-primary-600" aria-hidden="true"/>}
      </ClickableIcon>
      <span className="text-neutral-800 border-y border-neutral-200 bg-white shadow-sm h-8 xl:h-10 flex items-center self-center xl:min-w-12 text-center px-4">       
        {docIndex ? docIndex + 1 : 1}/{groupTotal?.value}</span>
      <ClickableIcon 
        label="Neste (shift + høgre piltast)" 
        className={`btn btn-outline btn-compact rounded-l-none ${isMobile ? 'rounded-full bg-white' : ''}`} 
        add={{doc: nextDocUuid}}
        disabled={!nextDocUuid || docIndex === undefined || docIndex >= (groupData?.length || 0) - 1}
      >
        {isMobile ? <PiCaretDoubleRight className="text-xl" aria-hidden="true"/> : <PiCaretRightBold className="xl:text-xl text-primary-600" aria-hidden="true"/>}
      </ClickableIcon>
  </div>}
  </>
}
  