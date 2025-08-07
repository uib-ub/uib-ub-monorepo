import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { GroupContext } from "@/app/group-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { stringToBase64Url } from "@/lib/utils"

import CoordinateMenu from "./coordinate-menu"
import { PiBinocularsFill } from "react-icons/pi"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import DynamicClickable from "@/components/ui/clickable/dynamic-clickable"
import { GlobalContext } from "@/app/global-provider"


export default function DetailsFooter() {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const fuzzyNav = searchParams.get('fuzzyNav')
    const { docData } = useContext(DocContext)

    const group = searchParams.get('group')
    const { setInitialUrl } = useContext(GroupContext)
    const {isMobile} = useContext(GlobalContext)


    return <div className={`flex gap-2 ${isMobile ? 'justify-end' : 'justify-between'} p-2 items-center`}>
    {doc && <CoordinateMenu/> }

    {!fuzzyNav && docData?._source.group?.id &&
      <DynamicClickable
        label="Namneformer"
        aria-current={(fuzzyNav && group == stringToBase64Url(docData?._source.group)) ? true : false}
        className="btn btn-primary btn-compact aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-10" 
        remove={['details', 'doc']} 
        onClick={() => setInitialUrl(`?${searchParams.toString()}`)}
        add={{group: stringToBase64Url(docData?._source.group.id), fuzzyNav: fuzzyNav || 'timeline'}}>
        <PiBinocularsFill className="text-lg text-white" aria-hidden="true"/>{!isMobile && 'Namneformer'}
      </DynamicClickable>
    }
  </div>

}