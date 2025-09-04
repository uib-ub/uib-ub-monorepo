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
import DocToolbar from "./doc/doc-toolbar"


export default function DetailsFooter({docData}: {docData: any}) {
    const { groupData } = useGroupData()

    console.log(groupData)
    const {isMobile} = useContext(GlobalContext)


    return <div className={`flex gap-2 border-t border-neutral-200 ${isMobile ? 'justify-end' : ''} p-2 items-center`}>
    <CoordinateMenu/>
    <DocToolbar docData={docData}/>

  </div>

}