'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useContext } from "react"
import MapExplorer from '@/components/Map/MapExplorer'
import { SearchContext } from '@/app/search-provider'
import Spinner from '@/components/svg/Spinner'
import ErrorMessage from '@/components/ErrorMessage'


export default function SearchView() {
    const { mapBounds, isLoading, searchError } = useContext(SearchContext)
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
        else {
            setDocs([])
        }
    }, [docs_uuid, params.dataset])
    


    return (
        <>

           { mapBounds?.length ? (
            <MapExplorer docs={docs} mapBounds={mapBounds} isLoading={isLoading}/>
            )
            :
            isLoading ? 
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner status="Laster inn kartet" className="w-20 h-20"/>
              </div>
            </div> 
            : 
            (
            searchError ? <ErrorMessage error={searchError} message="Kunne ikke gjennomføre søket"/>
            :
            <div role="status" aria-live="polite" className='flex items-center justify-center my-auto text-xl font-semibold'>Ingen treff i kart</div>
            )
          

          }
        </>
        

    )
}