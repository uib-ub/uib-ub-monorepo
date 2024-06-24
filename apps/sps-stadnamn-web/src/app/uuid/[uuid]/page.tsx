
import { fetchDoc } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { infoPageRenderers } from '@/config/info-renderers'
import CoordinateInfo from '@/app/view/[dataset]/doc/[uuid]/coordinate-info'
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import OriginalData from '@/app/view/[dataset]/doc/[uuid]/original-data'
import Thumbnail from '@/app/view/[dataset]/doc/[uuid]/thumbnail'
import Link from 'next/link'
import { PiDatabaseFill } from 'react-icons/pi'

export async function generateMetadata( { params }: { params: { uuid: string } }) {
    const doc = await fetchDoc(params)

    return {
        title: doc?._source.label,
        description: doc?._source.description
    }
}

export default async function LandingPage({ params }: { params: { uuid: string }}) {

    const doc = await fetchDoc({uuid: params.uuid})

    if (doc.error) {
        return <ErrorMessage error={doc} message="Kunne ikke hente dokumentet"/>
      }

    const docDataset = doc._index.split('-')[1]

    // Get the keys of the object to use as table headers


    // TODO: create shared component for uuid/ and view/doc/
    // TODO: create tabs for info, json, geojson and jsonld
    return (
        <div className="container instance-info flex flex-col flex-grow card container mx-auto p-4 sm:p-8 md:p-12 sm:mb-6 md:my-12 space-y-6">
            <h1>{doc._source.label}</h1>
            <div className='self-start'><Link className="btn btn-outline text-xl flex gap-2 no-underline" href={"/view/" + docDataset + "?docs=" + params.uuid}><PiDatabaseFill aria-hidden="true" className="text-2xl"/>{ datasetTitles[docDataset]}</Link></div>

            { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](doc._source) : null }

      
      {doc._source.image?.manifest && <div>
        <h2>Sedler</h2>
        <Link href={`/view/${docDataset}/iiif/${doc._source.image.manifest}`}><Thumbnail manifestId={doc._source.image.manifest} dataset={docDataset}/></Link>


        </div>}
        { doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      { doc._source.location && <div className='space-y-6'>
        <h2>Koordinater</h2>

        <CoordinateInfo source={doc._source}/>
        <EmbeddedMap doc={doc._source}/> 
        
      </div> }
    </div>
    )



}