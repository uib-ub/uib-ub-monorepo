import CopyLink from "@/components/doc/copy-link"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiBracketsCurly, PiDatabaseFill, PiInfinity, PiTagFill, PiWarningFill, PiX, PiTag, PiMagnifyingGlass, PiInfoFill, PiArrowRight, PiArrowUp, PiArrowElbowLeftUp, PiMagnifyingGlassFill, PiInfoDuotone, PiInfo, PiCaretLeft, PiArrowLeft, PiTableFill, PiInfinityBold, PiBracketsCurlyBold, PiMagnifyingGlassBold, PiPlayFill, PiCaretRight, PiFiles } from "react-icons/pi"
import ClientThumbnail from "../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audio-button"
import Clickable from "@/components/ui/clickable/clickable"
import { useDataset } from "@/lib/search-params"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { treeSettings } from "@/config/server-config"
import CadastreBreadcrumb from "./cadastre-breadcrumb"
import { GlobalContext } from "@/app/global-provider"
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import CoordinateInfo from "./coordinate-info"
import ExternalLinkTooltip from "@/components/ui/clickable/external-link-tooltip"
import Etymology from "./etymology"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import IconLink from "@/components/ui/icon-link"
import FacetsInfobox from "@/components/doc/facets-infobox"
import SearchDocInfo from "@/components/doc/search-doc-info"



export default function DocInfo({docParams}: {docParams?: any}) {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    let { docDataset, docData, snidParent, sameMarkerList } = useContext(DocContext)
    if (docParams) {
        docDataset = docParams.docDataset
        docData = docParams.docData
        snidParent = docParams.snidParent
        sameMarkerList = docParams.sameMarkerList
    }

    const docSource = docData._source
    const parent = searchParams.get('parent')
    const mode = searchParams.get('mode') || 'map'
    const doc = searchParams.get('doc')
    const { isMobile, sosiVocab, preferredTabs } = useContext(GlobalContext)

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }


    return <><article className="instance-info flex flex-col gap-3 mobile-padding">
      {(((docDataset && dataset != docDataset) || docData?._source?.within) || !isMobile) && <div className="!mt-0">

        { dataset == 'search' && docDataset != 'search' && <div className="flex gap-1  items-center">
          {parent && isMobile && <ClickableIcon label="Tilbake" 
        add={{doc: parent}}
        className="text-lg flex p-1 mr-3 rounded-md bg-neutral-50 border border-neutral-200 items-center no-underline"
        aria-label="Tilbake">
            <PiArrowLeft className="text-neutral-800 text-sm"/>
        </ClickableIcon>}
          
          <span className="text-neutral-800 uppercase font-semibold tracking-wider text-sm">{datasetTitles[docDataset as string]}</span>
          
        <IconLink label="Om datasettet" 
              href={docDataset == 'search' ? '/info/search' : `/info/datasets/${docDataset}`}
              className="flex items-center">
                <PiInfoFill aria-hidden="true" className="text-lg text-primary-600"/>
        </IconLink>
        
        
        </div>
      
        }
        


        { dataset != 'search' && docData?._source?.within && docDataset && <CadastreBreadcrumb source={docData?._source} docDataset={docDataset} subunitName={treeSettings[docDataset]?.parentName}/>}
        {(mode == 'map' || (mode == 'doc' && !isMobile)) && 
        <div className="absolute top-2 right-0 flex gap-2">
          {snidParent && dataset == 'search' && mode != 'doc' &&
            <ClickableIcon label="Gå til stadnamnoppslag" 
                           add={{doc: snidParent}} 
                           aria-hidden="true" 
                           className="flex items-center">
                            {dataset == 'search' ? <PiCaretLeft className="text-2xl"/> :<PiTag className="text-2xl"/>}
          </ClickableIcon>}
          

          { mode == 'doc' ?
                  <Clickable 
                    remove={["mode"]} 
                    add={preferredTabs[dataset] ? {mode: preferredTabs[dataset]} : {}}
                    className=" flex items-center gap-1 text-lg btn btn-outline" 
                    aria-label="Tilbake">
                    <PiCaretLeft className="text-primary-600" aria-hidden="true"/>
                    {preferredTabs[dataset] == 'table' && 'Tilbake til tabellen'}
                    {preferredTabs[dataset] == 'list' && 'Tilbake til listen'}

                  </Clickable>
          :
                <Clickable 
                  remove={["doc"]} 
                  className="text-2xl" 
                  aria-label="Lukk">
                  <PiX aria-hidden="true"/>
                </Clickable>
        }


        </div>
        }
 
        </div>}


      


        <div className="flex gap-2"><h2>{docSource.label}</h2>{docSource.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/hord/${docSource.audio.file}` } 
                       iconClass="text-3xl text-neutral-700 inline"/>             
        }
        </div>
        <div className="flex gap-1 flex-wrap">
        {
         docSource.sosi && docDataset != 'search' && <ExternalLinkTooltip description={`SOSI-stadnarden${sosiVocab[docSource.sosi] ? `: ${sosiVocab[docSource.sosi]['description']}` : ''}`} className="flex items-center bg-neutral-50 border border-neutral-200 pl-2 pr-0 rounded-md text-neutral-950 no-underline external-link"
         href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + docSource.sosi}>
            { sosiVocab[docSource.sosi]?.label || docSource.sosi}
        </ExternalLinkTooltip>
         
        }
        
            {Array.isArray(docSource.wikiAdm) && docSource.wikiAdm?.length > 1 && 
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
            }       

        </div>
            
      
      { docDataset == 'search' && <SearchDocInfo docSource={docSource}/> }
      
      
      { docDataset && infoPageRenderers[docDataset]?.( docSource) }

      {docDataset != 'mu1950' && docDataset && docSource &&  <CollapsibleHeading title="Detaljar">
          <FacetsInfobox source={docSource}/>
      </CollapsibleHeading>}

      


        { (docSource.images?.length > 0 || docSource.image?.manifest) && mode != 'list' && <div>
        <h3 className="!mt-0 !py-0">Sedler</h3>
        <ClientThumbnail images={docSource.images || [{manifest: docSource.image.manifest, dataset: docDataset}]}/>
        </div>}


        { docSource.location && <div>
          <CollapsibleHeading title="Koordinatinformasjon">
            <CoordinateInfo source={docSource}/>
          </CollapsibleHeading>
        </div>}


        <div className="flex gap-4 flex-wrap mt-2 pt-2 text-neutral-950 border-t border-neutral-200">
        { docDataset != 'nbas' && (docSource.datasets?.length > 1 || docSource.datasets?.[0] != 'nbas') ? 
          <>
            <Link href={"/uuid/" + docSource.uuid} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiInfinityBold aria-hidden="true"/>
              Varig side
            </Link>
            <CopyLink uuid={docSource.uuid}/> 
            </>
            : <div className="flex gap-4 items-center w-full pb-4"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet  er under utvikling. Denne siden kan derfor bli slettet</div>
            }
            {dataset != 'search' && snidParent &&
                <Clickable link className="flex items-center gap-1 no-underline" only={{dataset: 'search', doc: snidParent}}>
                  <PiTagFill aria-hidden="true"/>
                  Stadnamnoppslag
                </Clickable>
            }
            {dataset == 'search' && docDataset != dataset &&
                <Clickable link className="flex items-center gap-1 no-underline" only={{dataset: docDataset, doc}}>
                  <PiMagnifyingGlassBold aria-hidden="true"/>
                  Søk i datasettet
                </Clickable>
            }
            <Link href={"/uuid/" + docSource.uuid + ".json"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurlyBold aria-hidden="true"/>
              Json
            </Link>



   
        </div>
        
        </article>

        {( mode == 'map' && sameMarkerList?.length && doc != parent) ?
        
    
        <div className="instance-info !pt-4 mt-4 pb-4 border-t border-t-neutral-200">
    
        
            <h2 className="!text-base font-semibold uppercase !font-sans px-1">Same koordinat</h2>
            
            <nav className="flex flex-wrap w-full gap-2 mt-2">
            { sameMarkerList?.reverse().map((hit: any, index: number) => {
              const uuid = hit.fields?.uuid[0] || hit._source.uuid
              const children = hit.fields?.children?.[0] || hit._source?.children
              const label = hit.fields?.label || hit._source?.label

            return <Clickable link key={hit._id} role="tab" aria-selected={[uuid, children].includes(doc)} className="rounded-tabs" add={{doc: children ? children : uuid}}>
                {label}
            </Clickable>
            }
            )}
            </nav>
    
            </div>
            : null
    
        }
        {treeSettings[dataset] && docSource.sosi === 'gard' && mode != 'doc' && (!parent || mode == 'list') &&
        <div className="border-t border-t-neutral-200 pt-3 mt-3 mb-2">
                <Clickable link className="flex items-center gap-1 no-underline text-neutral-950 border border-neutral-200 p-2 rounded-md" 
                           add={{parent: docSource.uuid,
                            ...mode != 'map' ? {doc: docSource.uuid, mode: 'doc'} : {}
                           }}>
                  <PiTableFill className="text-primary-600" aria-hidden="true"/>
                  Vis underordna bruk
                </Clickable>
                </div>
            }
        </>

}