import { DocContext } from "@/app/doc-provider";
import { GroupContext } from "@/app/group-provider";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { useContext, useEffect, useState } from "react";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";


export default function HitNavigation() {
    const {groupData, groupLoading, groupTotal} = useContext(GroupContext)
    const {docData} = useContext(DocContext)
    const [ownPosition, setOwnPosition] = useState<number | undefined>(undefined)
    

    useEffect(() => {
      if (groupData?.find(doc => doc._id == docData?._id) !== undefined) {
        setOwnPosition(groupData?.findIndex((doc) => doc._id == docData?._id))
      }
    }, [groupData, docData, groupLoading])


    return <>
    {groupTotal?.value && groupTotal.value > 1 && <div className="flex gap-2 h-10">    
      
      <ClickableIcon 
        label="Forrige" 
        className="btn btn-outline btn-compact" 
        add={{doc: groupData?.[ownPosition !== undefined ? ownPosition - 1 : 0]?.fields?.uuid?.[0]
        }}
        disabled={ownPosition === undefined || ownPosition <= 0}
      >
        <PiCaretLeft className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
      <span className="text-neutral-900 self-center w-10 text-center">{ownPosition ? ownPosition + 1 : 1}/{groupTotal?.value}</span>
      <ClickableIcon 
        label="Neste" 
        className="btn btn-outline btn-compact" 
        add={{doc: groupData?.[ownPosition !== undefined ? ownPosition + 1 : 0]?.fields.uuid?.[0]}}
        disabled={ownPosition === undefined || ownPosition >= (groupData?.length || 0) - 1}
      >
        <PiCaretRight className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
  </div>}
  </>
}
  