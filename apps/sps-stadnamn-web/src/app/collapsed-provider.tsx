'use client'
import { createContext, useCallback, useContext, useRef } from 'react'
import { useState, useEffect } from 'react';
import { usePerspective, useSearchQuery } from '@/lib/search-params';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalContext } from './global-provider';
import { useMode } from '@/lib/search-params';
import { SearchContext } from './search-provider';
import { base64UrlToString } from '@/lib/utils';

interface CollapsedContextData {
    totalHits: Record<string, any> | null;
    isLoading: boolean;
    searchError: Record<string, string> | null;
    collapsedResults: any[];
    isLoadingResults: boolean;
    groupIndex: number | null;
  }
 
  export const CollapsedContext = createContext<CollapsedContextData>({
    totalHits: null,
    isLoading: true,
    searchError: null,
    collapsedResults: [],
    isLoadingResults: false,
    groupIndex: null,
    });

const PER_PAGE = 30

export default function CollapsedProvider({ children }: {  children: React.ReactNode }) {
    const { totalHits, isLoading, searchError } = useContext(SearchContext)

    const [collapsedResults, setCollapsedResults] = useState<any[]>([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const searchParams = useSearchParams()
    const page = searchParams.get('page')
    const {searchQueryString } = useSearchQuery()
    const nav = searchParams.get('nav')
    const mode = useMode()
    const { isMobile } = useContext(GlobalContext)
    const [groupIndex, setGroupIndex] = useState<number | null>(null)
    const group = searchParams.get('group')
    const router = useRouter()
    const datasetTag = searchParams.get('datasetTag')

    // Reset when search query changes
    
    useEffect(() => {
        setCollapsedResults([])
      }, [searchQueryString])

      const nextPageNavigation = useCallback(() => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set('page', (Number(page) + 1).toString())
        router.replace(`?${newParams.toString()}`)
      }, [searchParams, router, page])


      useEffect(() => {
        if (!group || datasetTag == 'base') return
        
        const foundGroupIndex = collapsedResults?.findIndex((result: any) => result.fields?.["group.id"]?.[0] == base64UrlToString(group))
        if (foundGroupIndex && foundGroupIndex > -1) {
            setGroupIndex(foundGroupIndex)
            if (foundGroupIndex == collapsedResults.length - 1) {
                nextPageNavigation()
            }
        }
        else {
            setGroupIndex(null)
        }
      }, [group, collapsedResults, nextPageNavigation, datasetTag])


    
  
  
      useEffect(() => {
        setIsLoadingResults(true)

        if ((nav != 'results' && !isMobile) || mode == 'table') return
        const size = datasetTag == 'base' ? 100 : (page ? PER_PAGE * (parseInt(page) + 1) : PER_PAGE)
        const url = `/api/search/collapsed?${searchQueryString}&size=${size}&from=${(page ? parseInt(page) : 0) * PER_PAGE || 0}`
        fetch(url)
          .then(response => {
            if (!response.ok) {
              setIsLoadingResults(false)
              throw response
            }
            return response.json()
          })
          .then(es_data => {
  
            setCollapsedResults(prev => [...prev, ...es_data.hits.hits.filter((hit: any) => !prev.find((prevHit: any) => prevHit._id === hit._id))])
          })
          .finally(() => setIsLoadingResults(false))
      }, [searchQueryString, page, isMobile, nav, mode, datasetTag])


    


  return <CollapsedContext.Provider value={{totalHits, isLoading, searchError, collapsedResults, isLoadingResults, groupIndex}}>{children}</CollapsedContext.Provider>
}




