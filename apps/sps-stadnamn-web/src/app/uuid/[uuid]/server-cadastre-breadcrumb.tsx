import { treeSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"
import Link from "next/link"

export default function ServerCadastreBreadcrumb({source, docDataset, subunitName}: {source: Record<string, any>, docDataset: string, subunitName: string}) {
    const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
    const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) + " " + source.label
    return <div>
      <Link className="breadcrumb-link text-base" 
                 href={`/uuid/${source.within}`}>{parentLabel}
      </Link>
      <span className="mx-2">/</span>{currentName}</div>
  }