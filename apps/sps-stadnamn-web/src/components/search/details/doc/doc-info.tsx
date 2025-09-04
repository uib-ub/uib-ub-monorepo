import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiInfoFill } from "react-icons/pi"
import ClientThumbnail from "../../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import { useContext, useMemo } from "react"
import { treeSettings } from "@/config/server-config"
import CadastreBreadcrumb from "./cadastre-breadcrumb"
import { GlobalContext } from "@/app/global-provider"
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import ExternalLinkTooltip from "@/components/ui/clickable/external-link-tooltip"
import IconLink from "@/components/ui/icon-link"
import FacetsInfobox from "@/components/doc/facets-infobox"
import SearchDocInfo from "@/components/doc/search-doc-info"
import { facetConfig } from "@/config/search-config"
import { getFieldValue } from "@/lib/utils"
import ErrorMessage from "@/components/error-message"
import Timeline from "@/components/doc/timeline"
import useDocData from "@/state/hooks/doc-data"
import { usePerspective, useMode } from "@/lib/param-hooks"



export default function DocInfo({docParams}: {docParams?: {docData: Record<string, any>, docDataset?: string}}) {
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const { docDataset, docData } = useDocData(docParams)
    const docSource = docData?._source
    const mode = useMode()
    const datasetTag = searchParams.get('datasetTag')
    const { isMobile, sosiVocab } = useContext(GlobalContext)

    
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

      <div className="!mt-0">

       {<div className="flex gap-1  items-center">
          
          <span className="text-neutral-800 uppercase font-semibold tracking-wider text-sm">{datasetTitles[docDataset as string]}</span>
          
        <IconLink label="Om datasettet" 
              href={ `/info/datasets/${docDataset.split('_')[0]}`}
              className="flex items-center">
                <PiInfoFill aria-hidden="true" className="text-lg text-primary-600"/>
        </IconLink>
        
        </div>}
      
      
 
        </div>

        <div className="flex gap-2"><h2>{docSource.label}</h2>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
        {
         docSource.sosi && docDataset != 'search' && <ExternalLinkTooltip description={sosiVocab[docSource.sosi] ? `SOSI-standarden: ${sosiVocab[docSource.sosi]['description']}` : 'stadtype'} className="flex items-center bg-neutral-50 border border-neutral-200 pl-2 pr-0 rounded-md text-neutral-950 no-underline external-link"
         href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + docSource.sosi}>
            { sosiVocab[docSource.sosi]?.label || docSource.sosi}
        </ExternalLinkTooltip>
         
        }
        {  treeSettings[docDataset] && <CadastreBreadcrumb source={docData?._source} docDataset={docDataset} subunitName={treeSettings[docDataset]?.parentName}/>}  
        
            {!treeSettings[docDataset] && ( Array.isArray(docSource.wikiAdm) && docSource.wikiAdm?.length > 1 && 
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

        </div>

       
            
      
      { docDataset == 'search' && <SearchDocInfo docSource={docSource}/> }

      { docSource.attestations && <Timeline arr={docSource.attestations} parent={docSource.uuid}/> }
      
      
      
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