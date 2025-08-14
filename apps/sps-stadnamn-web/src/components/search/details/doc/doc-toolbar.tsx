import CopyLink from "@/components/doc/copy-link"
import { PiArrowsOut } from "react-icons/pi"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { GroupContext } from "@/app/group-provider"
import IconLink from "@/components/ui/icon-link"


export default function DocToolbar() {
    const searchParams = useSearchParams()

    const { docData } = useContext(DocContext)
    const { groupData } = useContext(GroupContext)
    const fuzzyNav = searchParams.get('fuzzyNav')

    return <div className="flex gap-2 h-10">
    {(!fuzzyNav && groupData && groupData?.length > 1)  ? <>
 
    <CopyLink uuid={docData?._source?.uuid} isIconButton={true} className="btn btn-outline btn-compact"/> 
    <IconLink label="Åpne" href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
      <PiArrowsOut className="xl:text-xl" aria-hidden="true"/>
    </IconLink>
    
    </>
    :
    <>
    <CopyLink uuid={docData?._source?.uuid} isIconButton={false} className="btn btn-outline btn-compact"/> 
    <Link href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
      <PiArrowsOut className="text-xl" aria-hidden="true"/> Åpne
    </Link>
    </>
    
    }
    </div>
}