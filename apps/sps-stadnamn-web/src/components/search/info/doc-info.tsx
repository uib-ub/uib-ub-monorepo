import CopyLink from "@/components/doc/copy-link"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiArrowRight, PiArrowRightBold, PiBracketsCurly, PiDatabaseFill, PiInfinity, PiTable, PiTagFill, PiWarningFill } from "react-icons/pi"
import ClientThumbnail from "../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audio-button"
import SearchLink from "@/components/ui/search-link"
import { useDataset } from "@/lib/search-params"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { treeSettings } from "@/config/server-config"

export default function DocInfo() {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const { docDataset, docData, parentData } = useContext(DocContext)

    const docSource = docData._source
    const parent = searchParams.get('parent')
    const mode = searchParams.get('mode') || 'map'
    const doc = searchParams.get('doc')


    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }


    
    return <article className="instance-info flex flex-col gap-3 mobile-padding">
        <div className="flex gap-2"><h2>{docSource.label}</h2>{docSource.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${docDataset}/${docSource.audio.file}` } 
                       iconClass="text-3xl text-neutral-700 inline"/> 
        }
        </div>
        <div className="flex gap-2 flex-wrap">
        {
         docSource.sosi && docDataset != 'search' && <Link className="flex items-center bg-neutral-100 pl-3 pr-1 rounded-full text-neutral-900 no-underline external-link"
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
                    &&  <Link  className="flex align-middle bg-neutral-100 pr-1 pl-3 rounded-full text-neutral-900 no-underline external-link" href={'http://www.wikidata.org/entity/' + docSource.wikiAdm}>
                        
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
         
              className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline">
                {docDataset == 'search' ? <><PiTagFill aria-hidden="true"/> Stadnamnsøk</> : <><PiDatabaseFill aria-hidden="true"/>{datasetTitles[docDataset as string]}</>}</Link>
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
        { docSource.sosi == 'gard' && mode != 'table' && treeSettings[dataset] &&
      <div className={`flex ${(!parent || parent != docSource.uuid) ? '' : 'lg:hidden'}`}>
        <SearchLink className="flex items-center gap-2 font-semibold rounded-md w-full no-underline border border-neutral-200 hover:bg-neutral-100 p-2 px-4 mt-2" add={{parent: docSource.uuid }}>
          <PiTable aria-hidden="true" className="text-primary-600"/> Garder
        </SearchLink>
    </div>

      }

      {docData._source.children?.length > 0 && parent != docData._source.uuid &&
          <SearchLink add={{parent: docData._source.uuid}} 
                      className="flex items-center gap-2 font-semibold rounded-md w-full no-underline border border-neutral-200 hover:bg-neutral-100 p-2 px-4 mt-2">
                        
                          Kilder <span className='text-xs bg-primary-600 text-white rounded-full px-1'>{docData._source.children.length}</span>
          </SearchLink>}

        {dataset == 'search' && parentData?._source && parent != doc && 
        <SearchLink add={{doc: parentData._source.uuid}} className="flex items-center gap-2 font-semibold rounded-md w-full no-underline border border-neutral-200 hover:bg-neutral-100 p-2 px-4 mt-2">
          <PiTagFill className="text-2xl text-neutral-800" aria-hidden="true"/>
          <span className="text-neutral-950">Overordnet oppslag</span>
        </SearchLink>
        }


        


        </article>

}