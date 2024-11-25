'use client'
import { SearchContext } from "@/app/map-search-provider"
import { useContext, useEffect } from "react"
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useDataset } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";
import CadastralItem from "./cadastral-item";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { treeSettings } from "@/config/server-config";
import SearchParamsLink from "@/components/ui/search-params-link";
import { datasetTitles } from "@/config/metadata-config";


export default function TreeResults({isMobile}: {isMobile: boolean}) {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const serialize = createSerializer({
        from: parseAsInteger,
        size: parseAsInteger,
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
    });

    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'search'})
    const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false)
    const [cadastralData, setCadastralData] = useState<any>(null)


    const { resultData, totalHits, isLoading, searchError } = useContext(SearchContext)
    const size = useQueryState('size', parseAsInteger.withDefault(20))[0]
    

    // Todo: adapt to datasets with adm3
    const adm1 = searchParams.get('adm1')
    const adm2 = searchParams.get('adm2')
    
    const aggregate = adm2 ? undefined : adm1 ? 'adm2' : 'adm1'
    const aggSort = treeSettings[dataset]?.aggSort
    
    
    useEffect(() => {
      if (aggregate) {
        setIsLoadingTree(true)
    
        fetch(`/api/tree?dataset=${dataset}${adm1 ? `&adm1=${adm1}` : ''}${adm2 ? `&adm2=${adm2}` : ''}`)
            .then(response => response.json())
            .then(data => {
              setIsLoadingTree(false)
              setCadastralData(data)
            }
    
        ).catch(error => {
          console.error(error)
          setIsLoadingTree(false)
        }
        )
      }
    
        
    }, [dataset, adm1, adm2, aggregate])

    
    

     


  return (
    <>
    
    

    {adm1 && 
          <div className="px-4 py-2 text-lg">
            <SearchParamsLink className="breadcrumb-link" withoutParams={["adm1", "adm2", "size"]}>
            {datasetTitles[dataset]}
            </SearchParamsLink>
            <span className='mx-2'>/</span>
            {adm2 ?
              <>
              <SearchParamsLink className="breadcrumb-link" withoutParams={["adm2", "size"]}>
              {adm1}
              </SearchParamsLink>
              <span className='mx-2'>/</span>
              {adm2}
              </>
            : adm1
            }
          </div>
        }

    {isMobile && <h2>{datasetTitles[dataset]}</h2>}
    

    <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-400'>


{totalHits?.value ? <>
  { Array.from({length: Math.min(size, totalHits?.value)}, (_, i) => {
    if (i == (size -1) && size < totalHits?.value && i < resultData.length) {
      const hit = resultData[i]
      return <li className="w-full flex justify-center py-4" key={hit._id}>
                <Link className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline" href={serialize(new URLSearchParams(searchParams), {size: size + 40})}>Vis flere</Link>
              </li>
    }
    else if (i < resultData.length) {
      const hit = resultData[i]
      return <CadastralItem key={hit._id} hit={hit} isMobile={isMobile}/>
    }
    else {
      return <li className="h-10 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
        <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
      </li>

    }
  }
  )}
</> : null}

      
    </ul>
      {(searchError || (!isLoading && !resultData?.length)) && <div className="flex justify-center">
        <div role="status" aria-live="polite" className="text-primary-600 pb-4">{searchError && <strong>{searchError?.status}</strong>} Det har oppstått en feil</div>
      </div>
        }

    </>
    )
}
