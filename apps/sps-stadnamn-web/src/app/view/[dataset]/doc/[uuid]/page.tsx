
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import OriginalData from './original-data'
import Thumbnail from './thumbnail'
import Link from 'next/link'
import { infoPageRenderers } from '@/config/dataset-render-config'
import { fetchDoc } from '@/app/api/_utils/actions'
import { PiCaretLeftBold } from 'react-icons/pi'

export default async function DocumentView({ params, searchParams }: { params: { dataset: string, uuid: string }, searchParams: Record<string, string>}) { 

  // If searchParams not empty
  const hasSearchParams = Object.keys(searchParams).length > 0

  

  if (Array.isArray(params.dataset)) {
      throw new Error('Expected "dataset" to be a string, but received an array');
    }

    const doc = await fetchDoc(params)
    return (
      
      <div className="mx-2 p-4 lg:p-8 lg:overflow-y-auto space-y-6 instance-info">
        {
          hasSearchParams && <Link href={`/view/${params.dataset}?${new URLSearchParams(searchParams).toString()}`} className="no-underline inline"><PiCaretLeftBold aria-hidden="true" className='text-primary-600 inline mr-1'/>Tilbake til kartet</Link>
        }
        { doc && doc._source && <>
      
      <h2>{doc._source.label}</h2>
      { infoPageRenderers[params.dataset]? infoPageRenderers[params.dataset](doc._source) : null }
      {doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      {doc._source.image?.manifest && <div>
        <h3>Sedler</h3>
        <Link href={`/view/${params.dataset}/iiif/${doc._source.image.manifest}`}><Thumbnail manifestId={doc._source.image.manifest} dataset={params.dataset}/></Link>


        </div>}
      {doc._source.location && <div><h3>Koordinater</h3><EmbeddedMap doc={doc._source}/> </div> }
      </>}
      </div>
    )

  }

