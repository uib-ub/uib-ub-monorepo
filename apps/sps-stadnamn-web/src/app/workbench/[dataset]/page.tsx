'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useContext } from "react"
import MapExplorer from '@/components/Map/MapExplorer'
import { SearchContext } from '@/app/search-provider'


export default function SearchView() {
    const { mapBounds, isLoading } = useContext(SearchContext)
    const params = useParams()
    const [docs, setDocs] = useState<any>(null)
    const docs_uuid = useSearchParams().get('docs')

    if (Array.isArray(params.dataset)) {
        throw new Error('Expected "dataset" to be a string, but received an array');
      }

    useEffect(() => {
        if (docs_uuid) {
            fetch(`/api/docs?dataset=${params.dataset}&docs=${docs_uuid}`).then(response => response.json()).then(es_data => {
                setDocs(es_data.hits.hits)
            })
        }
    }, [docs_uuid, params.dataset])
    


    return (
        <>

           { mapBounds?.length ? (
            <MapExplorer docs={docs} mapBounds={mapBounds}/>
            )
            :
            isLoading ? 
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner className="w-20 h-20"/>
              </div>
            </div> 
            : <div role="status" aria-live="polite" className='flex items-center justify-center my-auto text-xl font-semibold'>Ingen treff i kart</div>
          
          

          }
        </>
        

    )
}