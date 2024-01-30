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
  const [mapBounds, setMapBounds] = useState([])

  useEffect(() => {

      fetch('/api/search?dataset=hord&'+ searchParamsString).then(response => response.json()).then(data => {
        setData(data.hits)
        setMapBounds([[data.aggregations.viewport.bounds.top_left.lat, 
                      data.aggregations.viewport.bounds.top_left.lon],
                      [data.aggregations.viewport.bounds.bottom_right.lat,
                      data.aggregations.viewport.bounds.bottom_right.lon]])

      })
      console.log("SEARCH DATA", data)
      
    


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
       
        <span>{ data?.total?.value || 'Ingen' } treff</span>
        <section className='md:border md:border-slate-300 md:rounded-sm md:py-1 md:h-auto overflow-y-auto'>

        
        <ul className='flex flex-col gap-1 overflow-auto md:mx-1'>
          {data?.hits?.map(hit => (
            <li key={hit._id} className="my-0 border rounded-sm p-2 flex-grow"><strong>{hit._source.label}</strong> | {hit._source.rawData.kommuneNamn}</li>
          ))}
        </ul>

        </section>
    
      <nav className="center gap-2">

        {data?.total?.value > 10 && <Pagination totalPages={Math.ceil(data.total.value / (Number(searchParams.get('size')) || 10))}/>}

      </nav>
      


            
      </section>

      <section className='card md:grid md:grid-rows-7 md:col-span-3'>
      <div className="md:row-span-6 md:m-2">
        <MapExplorer center={data?.aggregations? [data.aggregations.centroid.location.lat, data.aggregations.centroid.location.lon] : undefined}
                      mapBounds={mapBounds}/>
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
