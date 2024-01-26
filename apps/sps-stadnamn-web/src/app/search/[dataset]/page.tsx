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


    <main className="flex flex-col md:flex-row h-full grow mb-3">
      <div className="bg-white shadow-md mx-2 p-2 md:w-1/5">
      <h2 className='text-xl mb-3 font-semibold'>Hordanamn</h2>
      <form id="search_form" onSubmit={ handleSubmit }>
        <input type="text" name="q" className='border-2 border-slate-400'/>
        <button type="submit" className='btn btn-primary p-1 px-2 mx-2'>Search</button>
      </form>

            
      </div>

      <div className='md:w-3/5 flex flex-col bg-white shadow-md'>
      <div className="mx-2 p-2 md:h-4/5 m-2 bg-lime-100">
        MAP
      </div>
      <div className=" mx-2 p-2 md:h-1/5">
        <h2 className='mb-3 font-semibold'>Info</h2>
        List with text:
        <ul>
          <li>- Info about dataset if no place name selected </li>
          <li>- Switch to showing image in map card</li>
        </ul>
        
      </div>
      </div>

      <div className="bg-white gap-2 flex flex-col shadow-md mx-2 p-2 md:w-1/5">
      <ul className='flex flex-col mb-auto'>
        {data?.hits?.hits.map(hit => (
          <li key={hit._id} className="my-2 border p-2 flex-grow"><strong>{hit._source.label}</strong> | {hit._source.rawData.kommuneNamn}</li>
        ))}
      </ul>
    <div className="flex flex-row justify-center gap-2">

    {data?.hits?.total.value > 10 && <Pagination totalPages={Math.ceil(data.hits.total.value / 10)}/>}


    </div>

      </div>
    </main>



  )
}
