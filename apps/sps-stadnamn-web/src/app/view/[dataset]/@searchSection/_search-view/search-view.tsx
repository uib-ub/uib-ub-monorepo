'use client'
import { useContext } from "react";
import SearchBar from "../SearchBar";
import { SearchContext } from '@/app/search-provider'
import Filters from "./filters";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useQueryStringWithout } from "@/lib/search-params";
import Results from "./results";


export default function SearchView() {

    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const searchParams = useSearchParams()
    const params = useParams()
    const router = useRouter()
    const filteredParamsWithoutSort = useQueryStringWithout(['docs', 'popup', 'expanded', 'search', 'asc', 'desc'])

    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const formData = new FormData(event.target);
        const formParams: string = Array.from(formData.entries())
            .filter(item => item[1] !== '') // filter out blank parameters
            .map(item => `${encodeURIComponent(item[0])}=${encodeURIComponent(item[1] as string)}`)
            .join('&');
        router.push(`/view/${params.dataset}?${formParams}${searchParams.get('display') == 'table' ? '&display=table' : ''}`)
        }

    return <>
    <form id="searchForm" className='flex flex-col gap-4' onSubmit={ handleSubmit }>
      <SearchBar/>
      { !searchError && <Filters/> }
    </form>            
      { searchParams.get('display') != 'table' && resultData && filteredParamsWithoutSort ? <Results hits={resultData.hits} isLoading={isLoading}/> : null }
    </>
}