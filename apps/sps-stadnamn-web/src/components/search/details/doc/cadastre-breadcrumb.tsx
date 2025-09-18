'use client'
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { useSearchQuery } from "@/lib/search-params"
import { getValueByPath } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { PiCaretRight, PiHouse, PiTreeView } from "react-icons/pi"

export default function CadastreBreadcrumb() {
    const searchParams = useSearchParams()
    const dataset = searchParams.get('dataset')
    const adm1 = searchParams.get('adm1')
    const adm2 = searchParams.get('adm2')

    return <>
      {dataset && (
        <>
        <Clickable className="breadcrumb-link text-lg whitespace-nowrap flex items-center gap-1" link add={{datasetTag: 'tree' }} remove={['adm1', 'adm2', 'dataset']}>
          Matriklar
        </Clickable>
        <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
        {adm1 && <>
                  <Clickable link className="breadcrumb-link text-lg whitespace-nowrap" 
          

                    remove={['adm1', 'adm2']}>{datasetTitles[dataset]}
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center-center flex-shrink-0" />
         </>}
        </>
      )}
      {adm1 && adm2 && (
        <>
          <Clickable link className="breadcrumb-link text-lg whitespace-nowrap" 
                     remove={['adm2']}>{adm1}
                     
          </Clickable>
          <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
        </>
      )}

      {dataset && <span className="text-lg">{adm2 || adm1 || datasetTitles[dataset]}</span>}
    </>
  }
  