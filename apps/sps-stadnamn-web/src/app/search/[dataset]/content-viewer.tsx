
import MapExplorer from '@/components/Map/MapExplorer'

import { useSearchParams, useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import ImageViewer from '@/components/Image/ImageViewer'
import DocumentView from './views/document-view'

export default function ContentViewer({ mapBounds, resultCount }: { mapBounds: [number, number][], resultCount: number }) {

    const searchParams = useSearchParams()
    const params = useParams()
    const doc_uuid = searchParams.get('docs')
    const view = searchParams.get('view')
    const [docs, setDocs] = useState<any>(null)

    useEffect(() => {
        if (doc_uuid?.length == 36) {
            fetch(`/api/doc?dataset=${params.dataset}&doc=${doc_uuid}`).then(response => response.json()).then(es_data => {
                setDocs([es_data])
            })
        }
        else if (doc_uuid?.includes(',')) {
            fetch(`/api/docs?dataset=${params.dataset}&docs=${doc_uuid}`).then(response => response.json()).then(es_data => {
                setDocs(es_data.hits.hits)
            })
        }
    }, [doc_uuid, params.dataset])




    return (

       docs && view == "info"?
        <DocumentView doc={docs[0]} />
        :
        <div className="h-full p-1">
          {
          view == 'image' ?
          <ImageViewer  />
          :  
          <MapExplorer mapBounds={mapBounds} docs={docs} resultCount={resultCount}/>

       
        }
        </div>

      
    )
  }
        

