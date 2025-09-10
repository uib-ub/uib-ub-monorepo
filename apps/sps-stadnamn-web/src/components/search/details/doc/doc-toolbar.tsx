import CopyLink from "@/components/doc/copy-link"
import { PiAnchor, PiArrowsOut, PiBrowser, PiBrowsers, PiCaretRight, PiCaretRightBold, PiDoorOpen, PiInfinity, PiInfo, PiInfoFill, PiLinkSimple } from "react-icons/pi"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"


export default function DocToolbar( {docData}: {docData: any} ) {

    return <div className="flex h-10 gap-2">
  <IconLink label="Opne faktaark" href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
      <PiArrowsOut aria-hidden="true" className="text-lg"/>
    </IconLink>    
    <CopyLink uuid={docData?._source?.uuid} isIconButton={true} className="btn btn-outline btn-compact border-r"/> 
    
    </div>
}