
import { fetchDoc } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { infoPageRenderers } from '@/config/info-renderers'
import CoordinateInfo from '@/app/view/[dataset]/doc/[uuid]/coordinate-info'
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import OriginalData from '@/app/view/[dataset]/doc/[uuid]/original-data'
import Thumbnail from '@/components/ImageViewer/thumbnail'
import Link from 'next/link'
import { PiDatabaseFill, PiMagnifyingGlass } from 'react-icons/pi'
import GroupedChildren from '@/app/view/[dataset]/@searchSection/grouped-children'
import ThumbnailLink from '@/components/ImageViewer/thumbnail-link'

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

    const docDataset = doc._index.split('-')[2]

    // Get the keys of the object to use as table headers


    // TODO: create shared component for uuid/ and view/doc/
    // TODO: create tabs for info, json, geojson and jsonld
    return (
        <div className="instance-info flex flex-col flex-grow space-y-6">
            <h1>{doc._source.label}</h1>
            { docDataset != 'search' ?
            <div className='self-start'><Link className="btn btn-outline text-xl flex gap-2 no-underline" href={"/view/" + docDataset + "?docs=" + params.uuid}><PiDatabaseFill aria-hidden="true" className="text-2xl"/>{ datasetTitles[docDataset]}</Link></div>
            :
            <div className='self-start'><Link className="btn btn-outline text-xl flex gap-2 no-underline" href={"/view/" + docDataset + "?docs=" + params.uuid}><PiMagnifyingGlass aria-hidden="true" className="text-2xl"/>Vis i stadnamnsøket</Link></div>
}
            { infoPageRenderers[docDataset]? infoPageRenderers[docDataset](doc._source) : null }

      
      {doc._source.image?.manifest && <div>
        <h2>Seddel</h2>
        <ThumbnailLink doc={doc}/>

        </div>}
        { doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      { docDataset != 'search' && doc._source.location && <div className='space-y-6'>
        <h2>Koordinater</h2>

        <CoordinateInfo source={doc._source}/>
        <EmbeddedMap doc={doc._source}/> 
        
      </div> }
      { docDataset == 'search' &&

        <GroupedChildren snid={doc._source.snid} uuid={doc._source.uuid} childList={doc._source.children} landingPage/>


      }
    </div>
    )



}