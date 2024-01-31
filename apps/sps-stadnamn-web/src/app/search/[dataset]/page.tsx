'use client'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import Pagination from './pagination'
import MapExplorer from '@/components/Map/MapExplorer'


export default function SearchInterface() {  
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  console.log("PARAMS STRING", searchParamsString)
  console.log("QUERY", searchParams.get('q'))

  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapBounds, setMapBounds] = useState([])

  useEffect(() => {

      fetch('/api/search?dataset=hord&'+ searchParamsString).then(response => response.json()).then(es_data => {
        setData(es_data.hits)
        if (es_data.aggregations?.viewport?.bounds) {
          //console.log("AGGREGATIONS", es_data.aggregations)
          setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
            [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
        }
        

        console.log("SEARCH DATA", es_data)

      }).then(() => setIsLoading(false))
      
      
    


    }, [searchParamsString])


    const handleSubmit = async (event) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formParams = [...formData.entries()].map( item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1])}`).join('&');
      router.push(`/search/hord?${formParams}`)
    }

  return (


    <main className="md:grid md:grid-cols-4 mb-3 md:mx-2 gap-2 h-full">
      <section className="flex flex-col md:col-span-1 card gap-3 bg-white shadow-md p-2" aria-label="Filtre">
        <form id="search_form" className='w-full flex gap-1' onSubmit={ handleSubmit }>
        </form>
       
        { isLoading ? <div className="flex-grow flex items-center justify-center">
          <div className="ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div> :
        <>
        <span>{ data?.total?.value || 'Ingen' } treff</span>
        <section className='md:border md:border-slate-300 md:rounded-sm md:py-1 md:h-auto overflow-y-auto'>

        
        <ul className='flex flex-col gap-1 overflow-auto md:mx-1'>
          {data?.hits?.map(hit => (
            <li key={hit._id} className="my-0 border rounded-sm p-2 flex-grow"><strong>{hit._source.label}</strong> | {hit._source.rawData.kommuneNamn}</li>
          ))}
        </ul>


        </section>
        </>
      }
    
      <nav className="center gap-2">

        {data?.total?.value > 10 && <Pagination totalPages={Math.ceil(data.total.value / (Number(searchParams.get('size')) || 10))}/>}

      </nav>
      


            
      </section>

      <section className='card md:grid md:grid-rows-7 md:col-span-3'>
      <div className="md:row-span-6 md:m-2">
        <MapExplorer mapBounds={mapBounds}/>
      </div>
      <div className=" mx-2 p-2 md:row-span-1">
        <h2 className='mb-3 font-semibold'>Info</h2>
        List with text:
        <ul>
          <li>- Info about dataset if no place name selected </li>
          <li>- Switch to showing image in map card</li>
        </ul>
        
      </div>
      </section>


    </main>



  )
}
