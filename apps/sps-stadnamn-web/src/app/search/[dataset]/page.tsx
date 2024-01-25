'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from "react"


export default function SearchInterface() {  
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  console.log(searchParams)

  const [data, setData] = useState([])

  useEffect(() => {
  
    const getSearchResults = async () => {
      const response = await fetch('/api/search?dataset=hord&'+ searchParamsString)
      const data = await response.json()
      console.log(data)
      setData(data)
      }
      getSearchResults()

    }, [searchParamsString])


    const handleSubmit = async (event) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formParams = [...formData.entries()].map( item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1])}`).join('&');
      console.log(formParams)
      router.push(`/search/hord?${formParams}`)
    }

    const createQueryString = useCallback(
      (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
   
        return params.toString()
      },
      [searchParams]
    )
  

  return (


    <main className="flex flex-col md:flex-row h-full grow mb-3">
      <div className="bg-white shadow-md mx-2 p-2 md:w-1/5">
      <h2 className='text-xl mb-3 font-semibold'>Hordanamn</h2>
      <form id="search_form" onSubmit={ handleSubmit }>
        <input type="text" name="q" className='border-2 border-slate-400'/>
        <button type="submit" className='btn btn-primary p-1 px-2 mx-2'>Search</button>
      </form>

            
      </div>

      <div className="bg-white shadow-md mx-2 p-2 md:w-3/5">
        MAP
      </div>

      <div className="bg-white gap-2 flex flex-col shadow-md mx-2 p-2 md:w-1/5">
      <ul className='flex flex-col flex-grow'>
        {data?.hits?.hits.map(hit => (
          <li key={hit._id} className="my-2 border p-2 flex-grow"><strong>{hit._source.label}</strong><p>{hit._source.rawData.merknader}</p></li>
        ))}
      </ul>
    <div className="flex flex-row justify-center gap-2">
    <Link href={createQueryString('page', (parseInt(searchParams.get('page') || "0") - 1).toString())}>
    <button className="btn">
      Forrige
    </button>
    </Link>
    <Link href={createQueryString('page', (parseInt(searchParams.get('page') || "0") + 1).toString())}>
    <button className="btn">
      Neste
    </button>
    </Link>

    </div>

      </div>
    </main>



  )
}
