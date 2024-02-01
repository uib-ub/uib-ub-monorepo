'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import ContentViwer from './content-viewer'
import Spinner from '@/components/svg/Spinner'
import Results from './results'
import { ResultData } from './types'

export default function SearchInterface() {  
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsArray = Array.from(searchParams.entries());
  const filteredSearchParams = searchParamsArray.filter(([key]) => key !== 'document');
  const filteredSearchParamsString = new URLSearchParams(filteredSearchParams).toString();

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [mapBounds, setMapBounds] = useState<[number, number][]>([]);

  useEffect(() => {

      fetch('/api/search?dataset=hord&'+ filteredSearchParamsString).then(response => response.json()).then(es_data => {
        setResultData(es_data.hits)
        if (es_data.aggregations?.viewport?.bounds) {
          //console.log("AGGREGATIONS", es_data.aggregations)
          setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
            [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
        }
        

        console.log("SEARCH DATA", es_data)

      }).then(() => setIsLoading(false))
      
      
    


    }, [filteredSearchParamsString])


    const handleSubmit = async (event: any) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formParams = Array.from(formData.entries()).map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`).join('&');
      router.push(`/search/hord?${formParams}`)
    }

  return (
    <main className="search-view md:grid md:grid-cols-4 mb-3 md:mx-2 gap-2">
      <section className="flex flex-col md:col-span-1 card gap-3 bg-white shadow-md p-2 px-4 overflow-y-auto" aria-label="Filtre">
        <div className='flex flex-col'>
        <form id="search_form" className='flex gap-1' onSubmit={ handleSubmit }>
        </form>
       
        { !resultData || isLoading ? <div className="flex-grow flex items-center justify-center">
        <Spinner className="w-20 h-20"/>
        </div> : <Results resultData={resultData}/>

      }
        </div>
      </section>

      <section className='card flex flex-col md:col-span-3 h-full overflow-hidden'>
      <ContentViwer mapBounds={mapBounds}/>
      </section>


    </main>



  )
}
