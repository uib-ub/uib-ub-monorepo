
import EmbeddedMap from '@/components/Map/EmbeddedMap'
import OriginalData from './original-data'
import Thumbnail from './thumbnail'
import Link from 'next/link'
import { infoPageRenderers } from '@/config/client-config-renderers'


export default async function DocumentView({ params }: { params: { dataset: string, uuid: string }}) { 

  async function fetchDoc() {
    'use server'
    const res = await fetch(`https://search.testdu.uib.no/search/stadnamn-${params.dataset}-demo/_doc/${params.uuid}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${process.env.ES_TOKEN}`,
        }
    })
  const data = await res.json()
  return data

  }



  if (Array.isArray(params.dataset)) {
      throw new Error('Expected "dataset" to be a string, but received an array');
    }

    const doc = await fetchDoc()
    return (
      
      <div className="mx-2 p-4 lg:p-8 lg:overflow-y-auto space-y-6 info-content">
        { doc && <>
      
      <h2>{doc._source.label}</h2>
      { infoPageRenderers[params.dataset]? infoPageRenderers[params.dataset](doc._source) : null }
      {doc._source.rawData ?
        <div>
        <OriginalData rawData={doc._source.rawData}/>
        </div>
      : null}
      {doc._source.image?.manifest && <div>
        <h3>Sedler</h3>
        <Link href={`/view/${params.dataset}/iiif/${doc._source.image.manifest}`}><Thumbnail manifestId={doc._source.image.manifest}/></Link>


        </div>}
      {doc._source.location && <div><h3>Koordinater</h3><EmbeddedMap doc={doc._source}/> </div> }
      </>}
      </div>
    )

  }

