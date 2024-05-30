
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import OriginalData from './original-data'
import Thumbnail from './thumbnail'
import Link from 'next/link'
import { infoPageRenderers } from '@/config/info-renderers'
import { fetchDoc } from '@/app/api/_utils/actions'
import { PiCaretLeftBold } from 'react-icons/pi'
import ErrorMessage from '@/components/ErrorMessage'
import CoordinateInfo from './coordinate-info'

export default async function DocumentView({ params, searchParams }: { params: { dataset: string, uuid: string }, searchParams: Record<string, string>}) { 

  // If searchParams not empty
  const hasSearchParams = Object.keys(searchParams).length > 0

  

  if (Array.isArray(params.dataset)) {
      throw new Error('Expected "dataset" to be a string, but received an array');
    }

    const doc = await fetchDoc(params)
    const docDataset = doc._index.split('-')[1]

    if (doc.error) {
      return <ErrorMessage error={doc} message="Kunne ikke hente dokumentet"/>
    }

    return (
      
      <div className="mx-2 p-4 lg:p-8 lg:overflow-y-auto space-y-6 instance-info">
        {
          <Link href={`/view/${params.dataset}?${new URLSearchParams(searchParams).toString()}`} className="no-underline inline"><PiCaretLeftBold aria-hidden="true" className='text-primary-600 inline mr-1'/>{hasSearchParams ? 'Tilbake til kartet' : 'Vis på kartet'}</Link>
        }
        { doc && doc._source && <>
      
      <h2>{doc._source.label}</h2>
      { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](doc._source) : null }
      
      {doc._source.image?.manifest && <div>
        <h3>Sedler</h3>
        <Link href={`/view/${params.dataset}/iiif/${doc._source.image.manifest}`}><Thumbnail manifestId={doc._source.image.manifest} dataset={params.dataset}/></Link>


        </div>}
        {doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      {doc._source.location && <div className='space-y-3'>
        <h3>Koordinater</h3>

        <CoordinateInfo source={doc._source}/>
        <EmbeddedMap doc={doc._source}/> 
        
      </div> }
      </>}
      </div>
    )

  }

