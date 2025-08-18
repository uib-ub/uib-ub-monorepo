import CopyLink from "@/components/doc/copy-link"
import { PiArrowsOut, PiDoorOpen } from "react-icons/pi"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { GroupContext } from "@/app/group-provider"
import IconLink from "@/components/ui/icon-link"


export default function DocToolbar( {docData}: {docData: any} ) {

    return <div className="flex gap-2 h-10">
  
    <CopyLink uuid={docData?._source?.uuid} isIconButton={false} className="btn btn-outline btn-compact"/> 
    <IconLink label="Opne varig side" href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
      <PiDoorOpen className="xl:text-xl" aria-hidden="true"/>
    </IconLink>    
    </div>
}