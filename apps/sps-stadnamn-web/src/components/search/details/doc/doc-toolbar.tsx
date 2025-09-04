import CopyLink from "@/components/doc/copy-link"
import { PiAnchor, PiBrowser, PiBrowsers, PiCaretRight, PiCaretRightBold, PiDoorOpen, PiInfinity, PiInfo, PiInfoFill, PiLinkSimple } from "react-icons/pi"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"


export default function DocToolbar( {docData}: {docData: any} ) {

    return <div className="flex h-10">
  <IconLink label="Opne permanent infoside" href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline border-r-0 rounded-r-none btn-compact flex items-center gap-2">
      <PiLinkSimple aria-hidden="true" className="text-lg text-neutral-800"/>
    </IconLink>    
    <CopyLink uuid={docData?._source?.uuid} isIconButton={true} className="btn btn-outline rounded-l-none btn-compact border-r"/> 
    
    </div>
}