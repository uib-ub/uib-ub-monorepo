import { DocContext } from "@/app/doc-provider";
import { GlobalContext } from "@/app/global-provider";
import { GroupContext } from "@/app/group-provider";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";


export default function HitNavigation() {
    const {groupData, groupLoading, groupTotal, prevDocUuid, nextDocUuid, docIndex} = useContext(GroupContext)
    const {isMobile} = useContext(GlobalContext)

    



    return <>
    {groupTotal?.value && groupTotal.value > 1 && <div className="flex gap-2 h-10">    
      
      <ClickableIcon 
        label="Forrige" 
        link
        className="btn btn-outline btn-compact" 
        add={{doc: prevDocUuid}}
        disabled={!prevDocUuid || docIndex === undefined || docIndex <= 0}
      >
        <PiCaretLeft className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
      {!isMobile && <span className="text-neutral-900 self-center w-10 text-center">{docIndex ? docIndex + 1 : 1}/{groupTotal?.value}</span>}
      {isMobile && <Clickable className="btn btn-outline btn-compact w-24 text-center" add={{details: 'group'}}>{docIndex ? docIndex + 1 : 1}/{groupTotal?.value}</Clickable>}
      <ClickableIcon 
        link
        label="Neste" 
        className="btn btn-outline btn-compact" 
        add={{doc: nextDocUuid}}
        disabled={!nextDocUuid || docIndex === undefined || docIndex >= (groupData?.length || 0) - 1}
      >
        <PiCaretRight className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
  </div>}
  </>
}
  