'use client'

import { useRouter } from 'next/navigation'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import Pagination from './pagination'


export default function SearchInterface() {  
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  console.log("PARAMS STRING", searchParamsString)
  console.log("QUERY", searchParams.get('q'))

  const [data, setData] = useState([])

  useEffect(() => {
    const getSearchResults = async () => {
      const response = await fetch('/api/search?dataset=hord&'+ searchParamsString)
      const data = await response.json()
      console.log("DATA", data)
      setData(data)
    }
    getSearchResults()

    }, [searchParamsString])


    const handleSubmit = async (event) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formParams = [...formData.entries()].map( item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1])}`).join('&');
      router.push(`/search/hord?${formParams}`)
    }

  return (


    <main className="md:grid md:grid-cols-4 mb-3 mx-2 gap-2 !h-full">
      <section className="flex flex-col md:col-span-1 card gap-3 bg-white shadow-md p-2">
        <h2 className='text-xl mb-3 font-semibold'>Hordanamn</h2>
        <form id="search_form" className='w-full flex gap-1' onSubmit={ handleSubmit }>
          <input type="text" name="q" className='border border-slate-500 w-full rounded-sm'/>
          <button type="submit" className='btn btn-primary p-1 px-2'>Søk</button>

        </form>
       
        <span>{ data?.hits?.total.value || 'Ingen' } treff</span>
        <section className='md:border md:border-slate-500 md:rounded-sm md:py-1 md:h-[480px] overflow-y-auto'>

        
        <ul className='flex flex-col gap-1 overflow-auto md:mx-1'>
          {data?.hits?.hits.map(hit => (
            <li key={hit._id} className="my-0 border rounded-sm p-2 flex-grow"><strong>{hit._source.label}</strong> | {hit._source.rawData.kommuneNamn}</li>
          ))}
        </ul>

        </section>
    
      <nav className="center gap-2">

        {data?.hits?.total.value > 10 && <Pagination totalPages={Math.ceil(data.hits.total.value / (Number(searchParams.get('size')) || 10))}/>}

      </nav>
      


            
      </section>

      <section className='card grid md:col-span-3 bg-white shadow-md'>
      <div className="mx-2 p-2 md:row-span-5 m-2 bg-lime-100">
        MAP
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
