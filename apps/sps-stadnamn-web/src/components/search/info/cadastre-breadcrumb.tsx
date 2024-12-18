import ParamLink from "@/components/ui/param-link"
import { treeSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"

export default function CadastreBreadcrumb({source, docDataset, subunitName}: {source: Record<string, any>, docDataset: string, subunitName: string}) {
    const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
    const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) + " " + source.label
    return <div><ParamLink className="breadcrumb-link text-base" add={{doc: source.within}}>{parentLabel}</ParamLink><span className="mx-2">/</span>{currentName}</div>
  }