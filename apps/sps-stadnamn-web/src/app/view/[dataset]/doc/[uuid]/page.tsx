
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import ChildMap from '@/components/Map/ChildMap'
import OriginalData from './original-data'
import Link from 'next/link'
import { infoPageRenderers } from '@/config/info-renderers'
import { fetchDoc } from '@/app/api/_utils/actions'
import { PiCaretLeftBold, PiDatabaseFill, PiWarningFill, PiX } from 'react-icons/pi'
import ErrorMessage from '@/components/ErrorMessage'
import CoordinateInfo from './coordinate-info'
import CopyLink from './CopyLink'
import { datasetTitles } from '@/config/metadata-config'
import ThumbnailLink from '@/components/ImageViewer/thumbnail-link'
import PlaceType from '@/components/ui/place-type'
import { repeatingSearchParams } from '@/lib/utils'
import ParentButton from './ParentButton'

export async function generateMetadata( { params }: { params: { dataset: string } }) {
  const doc = await fetchDoc(params)

  return {
    title: (doc?._source.label ? doc._source.label + " | " : "") + datasetTitles[params.dataset] + " - Stadnamnportalen",
    description: doc?._source.description
  }
}

export default async function DocumentView({ params, searchParams }: { params: { dataset: string, uuid: string }, searchParams: Record<string, string>}) { 

  // If searchParams not empty
  const hasSearchParams = Object.keys(searchParams).length > 0


  if (Array.isArray(params.dataset)) {
      throw new Error('Expected "dataset" to be a string, but received an array');
    }

    
    const doc = await fetchDoc(params)
   

    if (!doc || doc.error) {
      return <ErrorMessage error={doc} message="Kunne ikke hente dokumentet"/>
    }

    const docDataset = doc._index.split('-')[2]

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    

    return (
      <div className="relative h-full w-full">
        {params.dataset == 'search' && docDataset == 'search' && <Link aria-label="Lukk" href={`/view/search?${hasSearchParams ? new URLSearchParams(searchParams).toString() : ('docs=' + params.uuid)}`} 
              className="no-underline absolute top-5 right-6 z-[2001] text-xl">
          <PiX aria-hidden="true" className='text-neutral-900 inline'/>
          
        </Link>}
      <div className={(docDataset == 'search' && doc._source.location) ? "bg-white  overflow-y-auto xl:absolute w-full xl:w-1/3 xl:top-2 xl:right-2 z-[2000] rounded-sm shadow-md xl:max-h-[80vh]"
        : 'instance-info h-full'
      }><div className='space-y-8 p-4 xl:p-8 overflow-y-auto h-full instance-info'>
        { docDataset != 'search' && <div className='flex flex-wrap gap-x-4 gap-y-2'>
        { params.dataset != 'search' && <Link href={`/view/${params.dataset}?${hasSearchParams ? repeatingSearchParams(searchParams).toString() : ('docs=' + params.uuid)}`} 
              className="no-underline inline">
          <PiCaretLeftBold aria-hidden="true" className='text-primary-600 inline mr-1'/>
          
          { hasSearchParams && searchParams.search != 'hide' ? 
          (searchParams.display == 'table' ? 'Tilbake til tabellen' :'Tilbake til kartet') : 
          (searchParams.display == 'table' ? 'Vis i tabellen' : 'Vis på kartet')}
        </Link>}
        
        <ParentButton uuid={doc._source.uuid} dataset={params.dataset}/>
        </div>
        }
        
        { doc && doc._source && <>
      
      <div className="flex flex-col gap-2">
        <h2>{doc._source.label}</h2>
      
      <div className="flex flex-wrap gap-4">
        {
         doc._source.sosi && docDataset != 'search' &&  <PlaceType sosiCode={doc._source.sosi}/>
        }
        <div className='flex'>
      {Array.isArray(doc._source.wikiAdm) && doc._source.wikiAdm?.length > 1 && 
        <>
        {[doc._source.adm1, doc._source.adm2].filter(item => typeof item == 'string').map((item, index) => <span key={index} className="inline whitespace-nowrap pr-1">{item}, </span>)}
        {[doc._source.adm1, doc._source.adm2, doc._source.adm3].find(item => Array.isArray(item))?.map((item: any, index: number) => <Link key={index} href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm[index]}>{item}</Link>)}
        </>
      
        || doc._source.wikiAdm && docDataset != 'm1838' &&  <span className="inline whitespace-nowrap"><Link  href={'http://www.wikidata.org/entity/' + doc._source.wikiAdm}>
          {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
          {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
          {multivalue(doc._source.adm1)}
          </Link> </span>
        || doc._source.adm1 && <span className="inline whitespace-nowrap">
          {doc._source.adm3 && multivalue(doc._source.adm3) + " – "}
          {doc._source.adm2 && multivalue(doc._source.adm2) + ", "}
          {multivalue(doc._source.adm1)}
        </span>
      }
      </div>
      
      
      { docDataset != 'search' &&  params.dataset == 'search' && 
        <span className='self-center'><Link className="no-underline flex gap-1 items-center" href={"/view/" + docDataset + "?docs=" + params.uuid}><PiDatabaseFill aria-hidden="true" className="text-lg self-center"/>{ datasetTitles[docDataset]}</Link></span>
      }
      
      { docDataset != 'nbas' && (doc._source.datasets?.length > 1 || doc._source.datasets?.[0] != 'nbas') ? 
          <CopyLink uuid={doc._source.uuid}/> 
          : <div className="flex gap-1 items-center w-full"><PiWarningFill className="inline text-primary-600 text-lg"/>Datasettet er under utvikling. Denne siden kan derfor bli slettet</div> // NBAS uris aren't stable until we've fixed errors in the dataset
      }
      </div>
      </div>
      
      

      { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](doc._source) : null }
      
      { doc._source.image?.manifest && <div>
        <h3>Seddel</h3>
        <ThumbnailLink doc={doc} dataset={params.dataset} searchParams={searchParams} />


        </div>}
        
      { docDataset != 'search' && doc._source.location && <div>
        <CoordinateInfo source={doc._source}/>
        </div> 
      }
      { doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
        : null
      }
      
      </>}
      </div>
      </div>
      { docDataset == 'search' && doc._source.location && <div className='w-full h-full pt-12 pl-4 pr-16 xl:p-0 bg-white'>


        <ChildMap doc={doc._source}/>
        
      </div> }
      </div>
      
    )

  }

