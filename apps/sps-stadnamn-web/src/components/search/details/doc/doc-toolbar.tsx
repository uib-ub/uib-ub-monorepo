import CopyLink from "@/components/doc/copy-link"
import IconLink from "@/components/ui/icon-link"
import { PiFileText } from "react-icons/pi"


export default function DocToolbar({ docData }: { docData: any }) {

  return <div className="flex h-10 gap-2">
    <IconLink label="Opne faktaark" href={`${process.env.NODE_ENV == 'development' ? '' : 'https://stadnamn.no'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
      <PiFileText aria-hidden="true" className="text-lg" />
    </IconLink>
    <CopyLink uuid={docData?._source?.uuid} isIconButton={true} className="btn btn-outline btn-compact border-r" />

  </div>
}