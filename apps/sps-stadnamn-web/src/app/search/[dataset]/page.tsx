'use client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from "react"
import ContentViwer from './content-viewer'
import Spinner from '@/components/svg/Spinner'
import Results from './results/results'
import Filters from './filters/filters'
import { useQueryStringWithout } from '@/lib/search-params'
import { ResultData } from './types'

export default function SearchInterface() {  
  const router = useRouter()
  const params = useParams()
  const searchQueryString = useQueryStringWithout(["document", "view"])

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [mapBounds, setMapBounds] = useState<[number, number][]>([]);

  useEffect(() => {

      fetch(`/api/search?dataset=${params.dataset}&${searchQueryString}`).then(response => response.json()).then(es_data => {
        setResultData(es_data)
        if (es_data.aggregations?.viewport?.bounds) {
          setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
            [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
        }

      }).then(() => setIsLoading(false))
    }, [searchQueryString, params.dataset])


    const handleSubmit = async (event: any) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formParams = Array.from(formData.entries()).map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`).join('&');
      router.push(`/search/${params.dataset}?${formParams}`)
    }

  return (
    <main className="search-view lg:grid lg:grid-cols-3 mb-3 lg:mx-2 gap-2">
      <section className="flex flex-col lg:col-span-1 card gap-3 bg-white shadow-md py-2 lg:overflow-y-auto h-full" aria-label="Filtre">
        <div className='flex flex-col h-full gap-6'>
          { !resultData || isLoading ?          
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner className="w-20 h-20"/>
              </div>
            </div> 
          : 
          <>
          <form id="search_form" onSubmit={ handleSubmit }>
            <Filters/>
          </form>
            
            <Results hits={resultData.hits}/>
          </>
          

          }
        </div>
      </section>

      <section className='card flex flex-col lg:col-span-2 lg:h-full lg:overflow-hidden'>
      <ContentViwer mapBounds={mapBounds}/>
      </section>


    </main>



  )
}
