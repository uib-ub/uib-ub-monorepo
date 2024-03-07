'use client'
import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation'
import IconButton from '@/components/ui/icon-button';
import Spinner from '@/components/svg/Spinner'
import Results from '@/components/results/results'
import Filters from './filters'
import SearchBar from './SearchBar'
import { PiInfoFill } from 'react-icons/pi'
import { SearchContext } from '@/app/search-provider'

import { datasetTitles } from '@/config/client-config'


export default function SearchSection () {
    const params = useParams()
    const router = useRouter()
    const { resultData, isLoading } = useContext(SearchContext)



      const handleSubmit = async (event: any) => {
        event.preventDefault()
        const formData = new FormData(event.target);
        const formParams = Array.from(formData.entries()).map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`).join('&');
        router.push(`/workbench/${params.dataset}?${formParams}`)
      }


    
    return (
        <>
        <div className='px-2 flex flex-wrap gap-y-2'><h1 id="dataset_heading" className='text-xl font-sans font-semibold flex gap-1'>{datasetTitles[params.dataset as string]}
        <IconButton className='align-middle' 
                    onClick={() => router.push(`/workbench/${params.dataset}/info`)}
                    label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconButton></h1>
        </div>
        <SearchBar/>
        <div className='flex flex-col h-full gap-6'>
          <form id="search_form" onSubmit={ handleSubmit }>
            <Filters/>
          </form>
          { isLoading ?          
            <div className="flex h-full items-center justify-center">
              <div>
                <Spinner className="w-20 h-20"/>
              </div>
            </div> 
          : 
          <>
          
            
            { !isLoading && resultData ? <Results hits={resultData.hits}/> : null }
          </>
          

          }
        </div>
        </>

        
    )
}