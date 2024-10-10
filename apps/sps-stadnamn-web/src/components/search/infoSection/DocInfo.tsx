import CopyLink from "@/app/view/[dataset]/doc/[uuid]/CopyLink"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiDatabaseFill, PiInfoBold, PiTagFill, PiWarningFill } from "react-icons/pi"
import ClientThumbnail from "./ClientThumbnail"
import Timeline from "./Timeline"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audioButton"

export default function DocInfo({doc}: {doc: any}) {
    const docDataset = doc._index.split("-")[2]
    const searchParams = useSearchParams()
    const dataset = searchParams.get('dataset') || 'search'

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }
    
    return <article className="instance-info flex flex-col gap-4">
        <div className="flex gap-2"><h2>{doc._source.label}</h2>{doc._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${dataset}/${doc._source.audio.file}` } 
                       iconClass="text-3xl text-neutral-700 inline"/> 
        }
        </div>
        <div className="flex gap-2 flex-wrap">
        {
         doc._source.sosi && docDataset != 'search' && <Link className="flex items-center gap-1 bg-neutral-100 pl-3 pr-1 rounded-full text-neutral-900 no-underline external-link"
         href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + doc._source.sosi}>
            { doc._source.sosi}
        </Link>
         
        }
        
            {Array.isArray(doc._source.wikiAdm) && doc._source.wikiAdm?.length > 1 && 
                <>
                {[doc._source.adm1, doc._source.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
                {[doc._source.adm1, doc._source.adm2, doc._source.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline" key={index} href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm[index]}>{item}</Link>)}
                </>
            
                || doc._source.wikiAdm && docDataset != 'm1838' 
                    &&  <Link  className="gap-1 flex align-middle bg-neutral-100 pr-1 pl-3 rounded-full text-neutral-900 no-underline external-link" href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm}>
                        
                        <span className="max-w-[12rem] truncate">
                {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
                {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
                {multivalue(doc._source.adm1)}
                </span>
                </Link>
                || doc._source.adm1 && <span className="inline whitespace-nowrap">
                {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
                {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
                {multivalue(doc._source.adm1)}
                </span>
            }
        
        { dataset == 'search' && <Link href={"/search?expanded=info&dataset="+docDataset} className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline">{docDataset == 'search' ? <><PiTagFill aria-hidden="true"/> Stadnamn</> : <><PiDatabaseFill aria-hidden="true"/>{datasetTitles[docDataset]}</>}</Link>}
        </div>

        { doc._source.attestations?.length && 
      <>
        <h3>Historikk</h3>
        <Timeline attestations={doc._source.attestations} />
      </>}

        { false && infoPageRenderers[docDataset] && infoPageRenderers[docDataset](doc._source) }

        { doc._source.image?.manifest && <div>
        <h3>Sedler</h3>
        <ClientThumbnail manifestId={doc._source.image?.manifest}/>


        </div>}


        <div className="flex gap-4 flex-wrap pt-8 pb-2 text-neutral-950">
        { docDataset != 'nbas' && (doc._source.datasets?.length > 1 || doc._source.datasets?.[0] != 'nbas') ? 
          <CopyLink uuid={doc._source.uuid}/> 
          : <div className="flex gap-1 items-center w-full pb-4"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet  er under utvikling. Denne siden kan derfor bli slettet</div> // NBAS uris aren't stable until we've fixed errors in the dataset
      }

    <Link href={"/uuid/" + doc._source.uuid} className="flex whitespace-nowrap items-center gap-1 no-underline">
        <PiInfoBold aria-hidden="true"/>
        Infoside</Link>
        </div>
        


        </article>

}