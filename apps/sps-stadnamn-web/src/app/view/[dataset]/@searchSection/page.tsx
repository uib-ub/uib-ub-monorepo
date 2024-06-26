'use client'
import { useContext } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import IconButton from '@/components/ui/icon-button';
import Results from '@/app/view/[dataset]/@searchSection/results'
import Filters from './filters'
import SearchBar from './SearchBar'
import { PiInfoFill } from 'react-icons/pi'
import { SearchContext } from '@/app/search-provider'

import { datasetTitles } from '@/config/metadata-config'
import { useQueryStringWithout } from '@/lib/search-params';
import SearchToggle from './SearchToggle'


export default function SearchSection () {
    const params = useParams<{dataset: string, uuid: string, manifestId: string}>()
    const router = useRouter()
    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const filteredParams = useQueryStringWithout(['docs', 'expanded', 'search'])
    const filteredParamsNoSort = useQueryStringWithout(['docs', 'expanded', 'search', 'orderBy', 'sort'])
    let [mainIndex, subindex] = params.dataset.split("_")
    const searchParams = useSearchParams()

    const showSearch = searchParams.get('search') == 'show'

    const handleSubmit = async (event: any) => {
    event.preventDefault()
    const formData = new FormData(event.target);
    const formParams: string = Array.from(formData.entries())
        .filter(item => item[1] !== '') // filter out blank parameters
        .map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`)
        .join('&');
    router.push(`/view/${params.dataset}?${formParams}`)
}


    
    return (
       <section className={`card flex flex-col xl:col-span-1 gap-3 bg-white py-2 xl:pt-4 !px-0 stable-scrollbar xl:overflow-y-auto w-full relative`} aria-label="Søkepanel">

        <div className='px-4 flex flex-wrap gap-y-2'>
          <h1 className='text-xl font-sans font-semibold flex gap-1' title={resultData && resultData.hits?.hits?.[0]?._index}>
            <SearchToggle>
              {datasetTitles[mainIndex] + (subindex ? ' | ' + datasetTitles[params.dataset].charAt(0).toUpperCase() + datasetTitles[params.dataset].slice(1) : '')}
            </SearchToggle>
              <IconButton className='align-middle' 
                          onClick={() => router.push(`/view/${params.dataset}/info${filteredParams ? '?' + filteredParams : ''}`)}
                          label="Info"><PiInfoFill className="text-2xl text-primary-600"/></IconButton>
          </h1>
        </div>
        
        
        <div id="collapsibleSearch" className={`${showSearch ?  'absolute xl:static z-[2000] xl:z-auto xl:flex top-[100%] bg-white shadow-md xl:shadow-none pb-8' : 'hidden xl:flex'} flex flex-col h-fit gap-4 w-full`} >
        <form id="searchForm" className='flex flex-col gap-4' onSubmit={ handleSubmit }>
          <SearchBar/>
          { !searchError && <Filters/> }
        </form>            
          { resultData && filteredParamsNoSort ? <Results hits={resultData.hits} isLoading={isLoading}/> : null }

        </div>        
        </section>

        
    )
}