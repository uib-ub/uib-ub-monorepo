import CopyLink from "@/components/doc/copy-link"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiBracketsCurly, PiDatabaseFill, PiInfinity, PiTagFill, PiWarningFill, PiX, PiTag, PiMagnifyingGlass } from "react-icons/pi"
import ClientThumbnail from "../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audio-button"
import ParamLink from "@/components/ui/param-link"
import { useDataset } from "@/lib/search-params"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { treeSettings } from "@/config/server-config"
import IconButton from "@/components/ui/icon-button"
import CadastreBreadcrumb from "./cadastre-breadcrumb"
import { useQueryState } from "nuqs"
import { GlobalContext } from "@/app/global-provider"

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
    const [doc, setDoc] = useQueryState('doc')
    const isMobile = useContext(GlobalContext).isMobile


    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }


    
    return <><article className="instance-info flex flex-col gap-3 mobile-padding">
      {((dataset != 'search' && docData?._source?.within && docDataset) || !isMobile) && <div className="!mt-0">

            

        { dataset != 'search' && docData?._source?.within && docDataset && <CadastreBreadcrumb source={docData?._source} docDataset={docDataset} subunitName={treeSettings[docDataset]?.parentName}/>}
        <button className="float-right absolute top-2 right-0 text-2xl" aria-label="Lukk" onClick={() => setDoc(null)}><PiX aria-hidden="true"/></button>
 
        </div>}
      


        <div className="flex gap-2"><h2>{docSource.label}</h2>{docSource.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/hord/${docSource.audio.file}` } 
                       iconClass="text-3xl text-neutral-700 inline"/>             
        }
        </div>
        <div className="flex gap-1 flex-wrap">
        {
         docSource.sosi && docDataset != 'search' && <Link className="flex items-center bg-neutral-50 border border-neutral-200 pl-3 pr-1 rounded-full text-neutral-950 no-underline external-link"
         href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + docSource.sosi}>
            { docSource.sosi}
        </Link>
         
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
        
        { dataset == 'search' && 
        <Link href={docDataset == 'search' ? '/info/search' : `/info/datasets/${docDataset}`}
         
              className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 px-2 rounded-md text-neutral-950 no-underline">
                {docDataset == 'search' ? <><PiTagFill aria-hidden="true" className="text-neutral-800"/> Stadnamnoppslag</> : <><PiDatabaseFill aria-hidden="true" className="text-neutral-800"/>{datasetTitles[docDataset as string]}</>}</Link>
        }

        

        </div>
      

      
      
      { docDataset && infoPageRenderers[docDataset] && infoPageRenderers[docDataset](docSource) }

      


        { docSource.image?.manifest && mode != 'list' && <div>
        <h3 className="!mt-0">Sedler</h3>
        <ClientThumbnail manifestId={docSource.image?.manifest}/>


        </div>}


        <div className="flex gap-4 flex-wrap mt-2 pt-2 text-neutral-900 border-t border-neutral-200">
        { docDataset != 'nbas' && (docSource.datasets?.length > 1 || docSource.datasets?.[0] != 'nbas') ? 
          <>
            <Link href={"/uuid/" + docSource.uuid} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiInfinity aria-hidden="true"/>
              Varig side
            </Link>
            <CopyLink uuid={docSource.uuid}/> 
            </>
            : <div className="flex gap-4 items-center w-full pb-4"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet  er under utvikling. Denne siden kan derfor bli slettet</div>
            }
            {snidParent &&
                <ParamLink className="flex items-center gap-1 no-underline text-neutral-950" only={{dataset: 'search', doc: snidParent}}>
                  <PiTag className="text-neutral-800" aria-hidden="true"/>
                  Stadnamnoppslag
                </ParamLink>
            }
            {dataset == 'search' && docDataset != dataset &&
                <ParamLink className="flex items-center gap-1 no-underline text-neutral-950" only={{dataset: docDataset, doc}}>
                  <PiMagnifyingGlass className="text-neutral-800" aria-hidden="true"/>
                  Søk i datasettet
                  
                </ParamLink>
            }
            <Link href={"/uuid/" + docSource.uuid + ".json"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurly aria-hidden="true"/>
              Json
            </Link>



   
        </div>
        </article>

        {(sameMarkerList?.length && doc != parent) ?
        
    
        <div className="instance-info !pt-4 mt-4 pb-4 border-t border-t-neutral-200">
    
        
            <h2 className="!text-base font-semibold uppercase !font-sans px-1">Alle treff på koordinatet</h2>
            
            <nav className="flex md:flex-wrap w-full flex-col md:flex-row gap-2 mt-2">
            { sameMarkerList?.reverse().map((hit: any, index: number) => {
            return <ParamLink key={hit._id} role="tab" aria-selected={[hit.fields?.uuid[0], hit.fields?.children?.[0]].includes(doc)} className="rounded-tabs" add={{doc: hit.fields.children?.length == 1 ? hit.fields.children[0] : hit.fields.uuid[0]}}>
                {hit.fields.label}
            </ParamLink>
            }
            )}
            </nav>
    
            </div>
            : null
    
        }
        </>

}