'use client'
import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation'
import IconButton from '@/components/ui/icon-button';
import Results from '@/app/view/[dataset]/@searchSection/results'
import Filters from './filters'
import SearchBar from './SearchBar'
import { PiInfoFill } from 'react-icons/pi'
import { SearchContext } from '@/app/search-provider'

import { datasetTitles } from '@/config/dataset-config'
import { useQueryStringWithout } from '@/lib/search-params';


export default function SearchSection () {
    const params = useParams<{dataset: string}>()
    const router = useRouter()
    const { resultData, isLoading } = useContext(SearchContext)
    const filteredParams = useQueryStringWithout(['docs'])
    let [mainIndex, subindex] = params.dataset.split("_")

      const handleSubmit = async (event: any) => {
        event.preventDefault()
        const formData = new FormData(event.target);
        const formParams = Array.from(formData.entries()).map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`).join('&');
        router.push(`/view/${params.dataset}?${formParams}`)
      }


    
    return (
        <>
        <div className='px-2 flex flex-wrap gap-y-2'><h1 id="dataset_heading" className='text-xl font-sans font-semibold flex gap-1'>
          {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[params.dataset].charAt(0).toUpperCase() + datasetTitles[params.dataset].slice(1) : '')}
        <IconButton className='align-middle' 
                    onClick={() => router.push(`/view/${params.dataset}/info${filteredParams ? '?' + filteredParams : ''}`)}
                    label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconButton></h1>
        </div>

        <div className='flex flex-col h-full gap-4'>
          <form id="searchForm" className='flex flex-col gap-4' onSubmit={ handleSubmit }>
            <SearchBar/>
            <Filters/>
          </form>            
            { resultData && filteredParams ? <Results hits={resultData.hits} isLoading={isLoading}/> : null }

        </div>
        </>

        
    )
}