'use client'
import { useContext, useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import { SearchContext } from '@/app/search-provider'
import Filters from "./filters";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useQueryStringWithout } from "@/lib/search-params";
import Results from "./results";
import PinnedResult from "./PinnedResult";


export default function SearchView() {

    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const router = useRouter()
    const filteredParamsWithoutSort = useQueryStringWithout(['docs', 'popup', 'expanded', 'search', 'asc', 'desc'])
    const [ showLoading, setShowLoading ] = useState<boolean>(true)


    useEffect(() => {
      if (!isLoading) {
        setTimeout(() => {
          setShowLoading(false)
        }, 200);
      }
      else {
        setShowLoading(true)
      }
    }
    , [isLoading])

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const formData = new FormData(event.target);
        const formParams: string = Array.from(formData.entries())
            .filter(item => item[1] !== '') // filter out blank parameters
            .map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`)
            .join('&');
        router.push(`/view/${params.dataset}?${formParams}${searchParams.get('display') == 'table' ? '&display=table' : ''}`)
        }
//{`${searchParams.get('search') == 'show' ?  'absolute xl:static z-[2002] xl:z-auto xl:flex top-[100%] bg-white shadow-md xl:shadow-none pb-8' : 'hidden xl:flex'} flex flex-col gap-4 w-full`} >
    return (
      <div id="collapsibleView" className="'absolute xl:static z-[2002] flex flex-col w-full top-0 bottom-0 h-full overflow-y-auto border-t border-neutral-200 pt-4 xl:pt-0 xl:border-none">
    <div className="overflow-y-auto !h-full">
  
    <form id="searchForm" className='flex flex-col gap-4' onSubmit={ handleSubmit }>
      <SearchBar showLoading={showLoading}/>
      { params.dataset == 'search' && params.uuid && !filteredParamsWithoutSort && searchParams.get('expanded') ? <PinnedResult/>
      : !searchError && <Filters/> }
    </form>          
      { searchParams.get('display') != 'table' && resultData?.hits?.hits?.length && filteredParamsWithoutSort ? <Results hits={resultData.hits}/> : null }
      </div>

      </div>
      )
}