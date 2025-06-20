'use client'
import Clickable from "@/components/ui/clickable/clickable"
import { contentSettings, treeSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export default function CadastreBreadcrumb({source, docDataset, subunitName}: {source: Record<string, any>, docDataset: string, subunitName: string}) {
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') || contentSettings[docDataset]?.display || 'map'
    const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
    const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) + " " + source.label
    return <div className="my-2">
      <Clickable link className="breadcrumb-link text-base" 
                 add={{doc: source.within, docDataset: docDataset, parent: mode != 'map' ? source.within : null}}>{parentLabel}
      </Clickable>
      <span className="mx-2">/</span>{currentName}</div>
  }