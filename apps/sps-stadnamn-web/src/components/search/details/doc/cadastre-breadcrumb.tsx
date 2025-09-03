'use client'
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { PiCaretRight } from "react-icons/pi"

export default function CadastreBreadcrumb({source, docDataset, subunitName}: {source: Record<string, any>, docDataset: string, subunitName: string}) {
    const searchParams = useSearchParams()
    const adm1 = source.adm1
    const adm2 = source.adm2
    const mode = searchParams.get('mode') || contentSettings[docDataset]?.display || 'map'
    const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
    const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) || getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + source.label 
    return <>
      {docDataset && (
        <>
          <Clickable link className="breadcrumb-link text-lg" 
                     add={{doc: source.within, parent: mode != 'map' ? source.within : null}}>{datasetTitles[docDataset]}
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center-center flex-shrink-0" />
        </>
      )}
      {adm1 && (
        <>
          <Clickable link className="breadcrumb-link text-lg" 
                     add={{doc: source.within, parent: mode != 'map' ? source.within : null, dataset: docDataset}}>{adm1}
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
        </>
      )}
      {adm2 && (
        <>
          <Clickable link className="breadcrumb-link text-lg" 
                     add={{doc: source.within, parent: mode != 'map' ? source.within : null, dataset: docDataset, adm1: adm1}}>{adm2}
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
        </>
      )}
      {source.within && (
        <>
          <Clickable link className="breadcrumb-link text-lg" 
                     add={{doc: source.within, parent: mode != 'map' ? source.within : null, dataset: docDataset, adm1: adm1, adm2: adm2}}>{parentLabel}
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
        </>
      )}
      <span className="text-lg">{currentName}</span>
    </>
  }
  