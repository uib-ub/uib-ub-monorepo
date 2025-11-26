'use client'
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiCaretRight, PiInfoFill, PiTreeView } from "react-icons/pi"
import ClientThumbnail from "../../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import { useContext, useMemo } from "react"
import { treeSettings } from "@/config/server-config"
import CadastreBreadcrumb from "./cadastre-breadcrumb"
import { GlobalContext } from "@/state/providers/global-provider"
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import ExternalLinkTooltip from "@/components/ui/clickable/external-link-tooltip"
import IconLink from "@/components/ui/icon-link"
import FacetsInfobox from "@/components/doc/facets-infobox"
import { facetConfig } from "@/config/search-config"
import { getFieldValue, getValueByPath } from "@/lib/utils"
import ErrorMessage from "@/components/error-message"
import Timeline from "@/components/doc/timeline"
import useDocData from "@/state/hooks/doc-data"
import { usePerspective, useMode } from "@/lib/param-hooks"
import Clickable from "@/components/ui/clickable/clickable"
import CadastralTable from "./cadastral-table"


export default function DocInfo({docParams}: {docParams?: {docData: Record<string, any>, docDataset?: string}}) {
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const { docDataset, docData } = useDocData(docParams)
    const docSource = docData?._source
    const mode = useMode()
    const datasetTag = searchParams.get('datasetTag')
    const { isMobile, sosiVocab } = useContext(GlobalContext)
    const nav = searchParams.get('nav')

    
    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    const filteredFacets = useMemo(() => {
        if (!docDataset || !docSource || (docDataset == 'mu1950' && docSource.sosi == 'gard')) return [];
        
        return facetConfig[docDataset]?.filter(item => {
            if (!item.key || item.noInfobox) return false;
            const value = getFieldValue(docSource, item.key);
            return value && value.length > 0;
        });
    }, [docDataset, docSource]);


    // Don't render if docData is not available yet
    if (!docSource) {
      return null
    }

    return <><article className={`instance-info flex flex-col gap-4 ${isMobile ? 'mb-12 px-2' : 'p-4 pb-8 '}`}>

      <div className="!mt-0 flex flex-col gap-1">

       {datasetTag != 'tree' && docDataset && <div className="flex gap-1  items-center">
          
          <span className="text-neutral-800 uppercase font-semibold tracking-wider text-sm">{datasetTitles[docDataset as string]}</span>
          
        <IconLink label="Om datasettet" 
              href={ `/info/datasets/${docDataset.split('_')[0]}`}
              className="flex items-center">
                <PiInfoFill aria-hidden="true" className="text-lg text-primary-700"/>
        </IconLink>
        
        </div>}


      
 
        </div>
        

        <div className="flex gap-2">
          <h2>{datasetTag == 'tree' && treeSettings[docDataset] ? docSource.within ? getValueByPath(docSource, treeSettings[docDataset].leaf) + " "  : getValueByPath(docSource, treeSettings[docDataset].subunit) + " " : ''}
            {docSource.label}</h2>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
        {
         docSource.sosi && docDataset != 'search' && <ExternalLinkTooltip description={sosiVocab[docSource.sosi] ? `SOSI-standarden: ${sosiVocab[docSource.sosi]['description']}` : 'stadtype'} className="flex items-center bg-neutral-50 border border-neutral-200 pl-2 pr-0 rounded-md text-neutral-950 no-underline external-link"
         href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + docSource.sosi}>
            { sosiVocab[docSource.sosi]?.label || docSource.sosi}
        </ExternalLinkTooltip>
         
        }
        
        
            { ( Array.isArray(docSource.wikiAdm) && docSource.wikiAdm?.length > 1 && 
                <>
                {[docSource.adm1, docSource.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
                {[docSource.adm1, docSource.adm2, docSource.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link className="flex items-center gap-1 bg-neutral-100 px-2 rounded-md text-neutral-900 no-underline" key={index} href={'http://www.wikidata.org/entity/' + docSource.wikiAdm[index]}>{item}</Link>)}
                </>
            
                || docSource.wikiAdm && docDataset != 'm1838' 
                    &&  <Link  className="flex align-middle bg-neutral-50 border border-neutral-200 pr-0 pl-2 rounded-md text-neutral-950 no-underline external-link" href={'http://www.wikidata.org/entity/' + docSource.wikiAdm}>
                        
                        <span className="max-w-[12rem] truncate">
                {docSource.adm3 && multivalue(docSource.adm3) + " – "}
                {docSource.adm2 && multivalue(docSource.adm2) + ", "}
                {multivalue(docSource.adm1)}
                </span>
                </Link>
                || docSource.adm1 && <span className="inline whitespace-nowrap">
                {docSource.adm3 && multivalue(docSource.adm3) + " – "}
                {docSource.adm2 && multivalue(docSource.adm2) + ", "}
                {multivalue(docSource.adm1)}
                </span>
           ) } 


           {treeSettings[docDataset] && (datasetTag != 'tree' || docSource.within) && docSource.within && <Clickable link 
           only={{datasetTag: 'tree', dataset: docDataset, adm2: docSource.adm2, adm1: docSource.adm1, doc: docSource.within}}
           className="inline items-center gap-1 bg-neutral-50 border border-neutral-200 pr-0 !px-2 rounded-md text-neutral-950 no-underline">
            {getValueByPath(docSource, treeSettings[docDataset]?.subunit) + " " + getValueByPath(docSource, treeSettings[docDataset].parentName )}
            </Clickable>}     

            {treeSettings[docDataset] && datasetTag != 'tree' && <Clickable link className="inline items-center gap-1 bg-neutral-50 border border-neutral-200 pr-0 !px-2 rounded-md text-neutral-950 no-underline" only={{datasetTag: 'tree', dataset: docDataset, adm2: docSource.adm2, adm1: docSource.adm1, doc: docSource.uuid}}>
            {getValueByPath(docSource, docSource.within ? treeSettings[docDataset].leaf : treeSettings[docDataset].subunit)} {docSource.label}
            </Clickable>}     

        </div>

        

       
            
      

      { docSource.attestations && <Timeline arr={docSource.attestations} parent={docSource.uuid}/> }
      
      {/* Replace the cadastral section with the new component */}
      { docDataset && docSource.sosi === 'gard' && (
        <CadastralTable 
          dataset={docDataset}
          uuid={docSource.uuid}
          list={false}
        />
      )}

      {docDataset && (() => {
        try {
          return infoPageRenderers[docDataset]?.(docSource);
        } catch (error: any) {
          return <ErrorMessage className="py-4" error={{error: error.message}} message="Det har oppstått ein feil."/>
        }
      })()}

      { filteredFacets?.length > 0 && 
        <CollapsibleHeading title="Detaljar" alwaysOpen={datasetTag != 'base' && !perspective.endsWith("_g")}>
            <FacetsInfobox source={docSource} docDataset={docDataset} filteredFacets={filteredFacets}/>
        </CollapsibleHeading>
        
      }

        { docSource.iiif && mode != 'list' && <div>
        <h3 className="!mt-0 !py-0">Sedler</h3>
        <ClientThumbnail iiif={docSource.iiif}/>
        </div>}




        
        
        </article>



        </>

}