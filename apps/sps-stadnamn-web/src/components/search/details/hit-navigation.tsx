'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { useDocIndex } from "@/lib/param-hooks";
import useGroupData from "@/state/hooks/group-data";
import { useContext } from "react";
import { PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";


export default function HitNavigation() {
    const {groupTotal } = useGroupData()
    const {isMobile} = useContext(GlobalContext)
    const docIndex = useDocIndex()


    return <>
    {groupTotal?.value && groupTotal.value > 1 && <div className="flex h-8 xl:h-10 w-full xl:w-auto bg-white rounded-md">    
      
      <ClickableIcon 
        label="Forrige (shift + venstre piltast)" 
        className={`btn btn-outline btn-compact rounded-r-none ${isMobile ? 'rounded-full' : ''}`} 
        add={{docIndex: docIndex -1}}
        disabled={docIndex <= 0}
      >
        <PiCaretLeftBold className="xl:text-xl text-primary-700" aria-hidden="true"/>
      </ClickableIcon>
      <span className="text-neutral-800 border-y border-neutral-200 shadow-sm h-8 xl:h-10 flex items-center self-center xl:min-w-12 text-center px-4">       
        {docIndex + 1}/{groupTotal?.value}</span>
      <ClickableIcon 
        label="Neste (shift + høgre piltast)" 
        className={`btn btn-outline btn-compact rounded-l-none ${isMobile ? 'rounded-full' : ''}`} 
        add={{docIndex: docIndex + 1}}
        disabled={docIndex >= (groupTotal?.value || 1) -1}
      >
        <PiCaretRightBold className="xl:text-xl text-primary-700" aria-hidden="true"/>
      </ClickableIcon>
  </div>}
  </>
}
  