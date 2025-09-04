import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import Clickable from "@/components/ui/clickable/clickable"
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils"

import CoordinateMenu from "./coordinate-menu"
import { PiBinocularsFill, PiCaretRightBold, PiTreeViewFill } from "react-icons/pi"
import { GlobalContext } from "@/app/global-provider"
import useDocData from "@/state/hooks/doc-data"
import useGroupData from "@/state/hooks/group-data"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { indexToCode } from "@/lib/utils"


export default function DetailsFooter() {
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav')
    const { groupData } = useGroupData()

    const group = searchParams.get('group')
    const docSource = groupData?.[0]?._source
    console.log(groupData)
    const docDataset = groupData?.[0] ? indexToCode(groupData?.[0]?._index)?.[0] : null
    const {isMobile} = useContext(GlobalContext)
    const doc = searchParams.get('doc')


    return <div className={`flex gap-2 border-t border-neutral-200 ${isMobile ? 'justify-end' : ''} p-2 items-center`}>
    <CoordinateMenu/>

    {!doc && docSource?.group?.id &&
      <Clickable
        aria-current={(namesNav && group == stringToBase64Url(docSource.group)) ? true : false}
        className="btn btn-primary btn-compact aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-10 self-end" 
        add={{namesNav: 'overview', details: 'doc', doc: docSource?.uuid, group: stringToBase64Url(docSource.group.id)}}>
        <PiBinocularsFill className="text-lg text-white" aria-hidden="true"/>
        Liknande namn
      </Clickable>
    }
  </div>

}