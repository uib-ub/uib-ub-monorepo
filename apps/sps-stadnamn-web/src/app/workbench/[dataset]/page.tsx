
'use client'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import { useQueryStringWithout } from '@/lib/search-params'
import { ResultData } from './types'
import MapExplorer from '@/components/Map/MapExplorer'
import Spinner from '@/components/svg/Spinner'

export default function SearchView() {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(false)
    const params = useParams()
    const searchParams = useQueryStringWithout(['docs'])
    const [mapBounds, setMapBounds] = useState<[number, number][]>([]);
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
    

    useEffect(() => {
        if (searchParams?.length) {
            setIsLoading(true)
            fetch(`/api/search?dataset=${params.dataset}&${searchParams}`).then(response => response.json()).then(es_data => {
            setResultData(es_data)
            if (es_data.aggregations?.viewport?.bounds) {
                setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
                    [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
            }
            else {
                setMapBounds([])
            }
            }).then(() => setIsLoading(false))
        }
      }, [searchParams, params.dataset])


    return (
        <>
        { isLoading ?          
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner className="w-20 h-20"/>
              </div>
            </div> 
          : (
            mapBounds.length ? (
            <MapExplorer mapBounds={mapBounds} docs={docs} resultCount={resultData?.hits?.total.value}/>
            )
            : <div role="status" aria-live="polite" className='flex items-center justify-center my-auto text-xl font-semibold'>Ingen treff i kart</div>
          )
          
          

          }
        </>
        

    )
}