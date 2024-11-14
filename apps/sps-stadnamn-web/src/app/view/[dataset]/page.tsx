'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useContext } from "react"
import MapExplorer from '@/components/map/map-explorer'
import { SearchContext } from '@/app/search-provider'
import Spinner from '@/components/svg/Spinner'
import ErrorMessage from '@/components/error-message'
import TableExplorer from './_table/table'


export default function ViewPage() {
    const { mapBounds, isLoading, searchError, resultData } = useContext(SearchContext)
    const params = useParams()
    const [docs, setDocs] = useState<any>(null)
    const searchParams = useSearchParams()
    const docs_uuid = searchParams.get('docs')

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

           { 

          searchParams.get('display') == 'table' ?
          <TableExplorer/>

          :
           
           mapBounds?.length ? (
            <MapExplorer docs={docs} mapBounds={mapBounds} isLoading={isLoading}/>
            )

            : 
            isLoading ? 
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner status="Laster inn treff" className="w-20 h-20"/>
              </div>
            </div> 
            : 
            (
            searchError ? <ErrorMessage error={searchError} message="Kunne ikke gjennomføre søket"/>
            :
            <>
            <div role="status" aria-live="polite" className='flex flex-col items-center justify-center my-auto text-2xl gap-y-1 font-semibold'>

            {resultData?.hits?.hits?.length ? <><div>Ingen treff med koordinat</div><div className='self-center text-center my-auto text-lg font-semibold text-neutral-800'>Sjå treff utan koordinat i resultatlista<br/>eller i tabellvisning</div></> : 
            <div>Ingen treff</div>}
            </div>
            
            </>
            )
          

          }
        </>
        

    )
}