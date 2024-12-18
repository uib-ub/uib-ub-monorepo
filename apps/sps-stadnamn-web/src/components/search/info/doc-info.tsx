import CopyLink from "@/components/doc/copy-link"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiArrowRight, PiArrowRightBold, PiArrowUp, PiArrowUpBold, PiBracketsCurly, PiDatabase, PiDatabaseFill, PiInfinity, PiTable, PiTableFill, PiTagFill, PiWarningFill, PiX } from "react-icons/pi"
import ClientThumbnail from "../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audio-button"
import ParamLink from "@/components/ui/param-link"
import { useDataset } from "@/lib/search-params"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { treeSettings } from "@/config/server-config"
import IconButton from "@/components/ui/icon-button"
import { useQueryState } from "nuqs"
import CadastreBreadcrumb from "./cadastre-breadcrumb"

export default function DocInfo() {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const { docDataset, docData, parentData } = useContext(DocContext)

    const docSource = docData._source
    const parent = searchParams.get('parent')
    const mode = searchParams.get('mode') || 'map'
    const [doc, setDoc] = useQueryState('doc')


    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }


    
    return <article className="instance-info flex flex-col gap-3 mobile-padding">
        <div className="flex w-full flex-wrap gap-2">
        {docData._source.children?.length > 0 &&
          <ParamLink add={{parent: docData._source.uuid}}
          arua-current={parent == docData._source.uuid ? 'page' : 'false'}
                      remove={['center', 'zoom']}
                      className="flex items-center gap-1 no-underline">
                        
                          {parent == docData._source.uuid ? <PiDatabaseFill className="text-accent-800" aria-hidden="true"/> : <PiDatabase className="text-neutral-900" aria-hidden="true"/>} Kilder <span className={`text-xs bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-full px-1`}>{docData._source.children.length}</span>
          </ParamLink>}


          { dataset != 'search' && docData._source.within && docDataset && <CadastreBreadcrumb source={docData._source} docDataset={docDataset} subunitName={treeSettings[docDataset].parentName} /> }



        {dataset == 'search' && parentData?._source && parent != doc && 
        <ParamLink add={{doc: parentData._source.uuid}} className="flex items-center gap-1 no-underline">
          {<PiArrowUpBold className="text-primary-600" aria-hidden="true"/>}
          <span className="text-neutral-950 sr-only xl:not-sr-only">Stadnamnside</span>
        </ParamLink>
        }

        { docSource.sosi == 'gard' && mode != 'table' && treeSettings[dataset] &&
  
                <ParamLink className="flex items-center gap-1 no-underline" add={{parent: docSource.uuid }}>
                  {parent ? <PiTableFill aria-hidden="true" className="text-accent-800"/> : <PiTable aria-hidden="true" className="text-primary-600"/>} Matrikkeltabell
                </ParamLink>
  

              }




        <ParamLink className="flex items-center gap-1 no-underline ml-auto" remove={['doc']}><PiX className="text-primary-600" aria-hidden="true"/> Lukk</ParamLink>
        </div>
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
                {[docSource.adm1, docSource.adm2, docSource.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline" key={index} href={'http://www.wikidata.org/entity/' + docSource.wikiAdm[index]}>{item}</Link>)}
                </>
            
                || docSource.wikiAdm && docDataset != 'm1838' 
                    &&  <Link  className="flex align-middle bg-neutral-50 border border-neutral-200 pr-1 pl-3 rounded-full text-neutral-950 no-underline external-link" href={'http://www.wikidata.org/entity/' + docSource.wikiAdm}>
                        
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
        <Link href={docDataset == 'search' ? '/info/search' : `/search?dataset=${docDataset}&nav=datasets&doc=${docSource.uuid}`}
         
              className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 px-2 rounded-full text-neutral-950 no-underline">
                {docDataset == 'search' ? <><PiTagFill aria-hidden="true" className="text-neutral-800"/> Stadnamn</> : <><PiDatabaseFill aria-hidden="true" className="text-neutral-800"/>{datasetTitles[docDataset as string]}</>}</Link>
        }

        

        </div>
      
      
      { docDataset && infoPageRenderers[docDataset] && infoPageRenderers[docDataset](docSource) }

      


        { docSource.image?.manifest && <div>
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
            <Link href={"/uuid/" + docSource.uuid + ".json"} className="flex whitespace-nowrap items-center gap-1 no-underline">
              <PiBracketsCurly aria-hidden="true"/>
              Json
            </Link>
        </>
          : <div className="flex gap-1 items-center w-full pb-4"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet  er under utvikling. Denne siden kan derfor bli slettet</div> // NBAS uris aren't stable until we've fixed errors in the dataset
      }


   
        </div>
        </article>

}