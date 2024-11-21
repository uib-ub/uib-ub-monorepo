import CopyLink from "@/components/doc/copy-link"
import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiBracketsCurly, PiDatabaseFill, PiInfinity, PiTagFill, PiWarningFill } from "react-icons/pi"
import ClientThumbnail from "../../doc/client-thumbnail"
import { infoPageRenderers } from "@/config/info-renderers"
import AudioButton from "@/components/results/audio-button"
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString } from "nuqs"
import AttestationSource from "../results/attestation-source"

export default function DocInfo({selectedDoc}: {selectedDoc: any}) {
    const searchParams = useSearchParams()
    const dataset = searchParams.get('dataset') || 'search'
    const docDataset = selectedDoc._index.split("-")[2]
    const docSource = selectedDoc._source

    const serialize = createSerializer({
      infoDataset: parseAsString,
      expanded: parseAsString,
      doc: parseAsString,
      point: parseAsArrayOf(parseAsFloat, ','),
  })

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    const attestationLabel = searchParams.get('attestationLabel')
    const attestationYear = searchParams.get('attestationYear')
    if (attestationLabel) {

      return <article className="instance-info flex flex-col gap-3">
        <h2>{attestationLabel}</h2>
        <AttestationSource uuid={docSource.uuid} snid={docSource.snid} childList={docSource.children} year={attestationYear} label={attestationLabel} />
        
      </article>
    }


    
    return <article className="instance-info flex flex-col gap-3">
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
        <Link href={serialize(new URLSearchParams(searchParams), {infoDataset: docDataset, expanded: 'info', doc: null, point: null})} 
              className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline">
                {docDataset == 'search' ? <><PiTagFill aria-hidden="true"/> Stadnamn</> : <><PiDatabaseFill aria-hidden="true"/>{datasetTitles[docDataset]}</>}</Link>}
        </div>

      
      { infoPageRenderers[docDataset] && infoPageRenderers[docDataset](docSource) }

      {
        attestationLabel && <div>
          

        </div>
      }
      


        { docSource.image?.manifest && <div>
        <h3>Sedler</h3>
        <ClientThumbnail manifestId={docSource.image?.manifest}/>


        </div>}


        <div className="flex gap-4 flex-wrap pt-8 pb-2 text-neutral-900">
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