
import MapExplorer from '@/components/Map/MapExplorer'

import { useSearchParams, useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import ImageViewer from '@/components/Image/ImageViewer'
import DocumentView from './views/document-view'

export default function ContentViewer({ mapBounds }: { mapBounds: [number, number][] }) {

    const searchParams = useSearchParams()
    const params = useParams()
    const doc_uuid = searchParams.get('document')
    const view = searchParams.get('view')
    const manifest = searchParams.get('manifest')
    const [doc, setDoc] = useState<any>(null)

    useEffect(() => {
        if (doc_uuid) {
            fetch(`/api/doc?dataset=${params.dataset}&doc=${doc_uuid}`).then(response => response.json()).then(es_data => {
                setDoc(es_data._source)
            })
        }
    }, [doc_uuid, params.dataset])




    return (

       doc && view == "info"?
        <DocumentView doc={doc} />
        :
        <div className="h-full p-1">
          {
          manifest ?
          <ImageViewer manifestId={manifest} />
          :  
          <MapExplorer mapBounds={mapBounds} doc={doc}/>

       
        }
        </div>

      
    )
  }
        

