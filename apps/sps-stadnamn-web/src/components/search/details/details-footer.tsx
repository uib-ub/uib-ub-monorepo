import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import Clickable from "@/components/ui/clickable/clickable"
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils"

import CoordinateMenu from "./coordinate-menu"
import { PiBinocularsFill, PiCaretRightBold } from "react-icons/pi"
import { GlobalContext } from "@/app/global-provider"
import useDocData from "@/state/hooks/doc-data"


export default function DetailsFooter( {source}: {source?: any}) {
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav')
    const { docData } = useDocData()

    const group = searchParams.get('group')
    const docSource = source || docData?._source
    const {isMobile} = useContext(GlobalContext)


    return <div className={`flex gap-2 ${isMobile ? 'justify-end' : 'justify-between'} p-2 items-center`}>
    <CoordinateMenu/>
    {JSON.stringify(docSource?.group)}

    {!namesNav && docSource?.group?.id &&
      <Clickable
        aria-current={(namesNav && group == stringToBase64Url(docSource.group)) ? true : false}
        className="btn btn-primary btn-compact aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-10" 
        add={{group: stringToBase64Url(docSource.group.id), namesNav: namesNav || 'timeline'}}>
        <PiBinocularsFill className="text-lg text-white" aria-hidden="true"/>Namneformer
      </Clickable>
    }
    {namesNav && group && source?.group?.id && docSource?.group?.id != base64UrlToString(group) && <Clickable
        className="btn btn-outline btn-compact flex items-center gap-2 flex-shrink-0 pl-6 whitespace-nowrap h-10" 
        remove={["namesNav"]} 
        add={{group: stringToBase64Url(docSource.group.id)}}>
        Vel gruppe<PiCaretRightBold className="text-primary-600" aria-hidden="true"/>
      </Clickable>
    }
  </div>

}