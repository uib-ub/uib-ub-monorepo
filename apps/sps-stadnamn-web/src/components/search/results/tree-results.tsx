'use client'
import { SearchContext } from "@/app/map-search-provider"
import { useContext, useEffect } from "react"
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";
import TreeItem from "./tree-item";
import { contentSettings, treeSettings } from "@/config/server-config";
import SearchParamsLink from "@/components/ui/search-params-link";
import { datasetTitles } from "@/config/metadata-config";
import { PiCaretRightBold } from "react-icons/pi";


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
    const{ size } = useSearchQuery()
    
    const adm = searchParams.get('adm')
    const admItems = adm?.split("__").reverse()
    const datasetDeepestAdm = contentSettings[dataset]?.adm
    const aggregate = !admItems?.length || datasetDeepestAdm && admItems.length < datasetDeepestAdm
    const aggSort = treeSettings[dataset]?.aggSort
    
    
    useEffect(() => {
      if (aggregate) {
        setIsLoadingTree(true)
    
        fetch(`/api/tree?dataset=${dataset}${adm ? `&adm=${adm}` : ''}`)
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
    
        
    }, [dataset, adm, aggregate])

    
    

     


  return (
    <>
    { adm &&
    <div className="px-4 py-2 text-lg flex">
        <SearchParamsLink id="tree-title" className="breadcrumb-link" withoutParams={["adm", "size"]}>
            Register
            </SearchParamsLink>&nbsp;/&nbsp;
        {admItems?.map((item, index) => {

            return (
                <div key={index}>
                  {index > 0 && <span>&nbsp;/&nbsp;</span>}
                  { index < admItems.length - 1 ?
                
                <SearchParamsLink className="breadcrumb-link" addParams={{adm: admItems.slice(0, index + 1).reverse().join("__")}}>
                    {item}
                </SearchParamsLink>
                : 
                <span>{item}</span>
                }
                </div>
            )
            })
        }
        </div>

    }
    
    


    {isMobile && <h2>{datasetTitles[dataset]}</h2>}
    

    <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-400'>


{(!aggregate && totalHits?.value && <>
  { Array.from({length: Math.min(size, totalHits?.value)}, (_, i) => {
    if (i == (size -1) && size < totalHits?.value && i < resultData.length) {
      const hit = resultData[i]
      return <li className="w-full flex justify-center py-4" key={hit._id}>
                <Link className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline" href={serialize(new URLSearchParams(searchParams), {size: size + 40})}>Vis flere</Link>
              </li>
    }
    else if (i < resultData.length) {
      const hit = resultData[i]
      return <TreeItem key={hit._id} hit={hit} isMobile={isMobile}/>
    }
    else {
      return <li className="h-10 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
        <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
      </li>

    }
  }
  )}
</>)}
{aggregate && cadastralData && <>
  {cadastralData?.aggregations?.adm?.buckets?.length &&
          <>
          {aggregate && !isLoadingTree && !isLoading && cadastralData?.aggregations.adm.buckets
                  .filter((item: any) => item.key != '_false')
                  .sort((a: any, b: any)=> aggSort ? a.aggNum.buckets[0].key.localeCompare(b.aggNum.buckets[0].key) : a.aggNum.localeCompare(b.key))
                  .map((admBucket: Record<string, any>) => {

            return <li key={admBucket.key} className="flex flex-col gap-2">
              <SearchParamsLink addParams={{adm: admBucket.key + (adm ? '__' + adm : '')}}
                    
                    className="lg:text-lg gap-2 px-4 mx-2 py-2 no-underline">
                      {treeSettings[dataset].showNumber && (adm ? admBucket.aggNum.buckets[0].key : admBucket.aggNum.buckets[0].key.slice(0,2))} {admBucket.key}
                      <PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/>
              </SearchParamsLink>
            </li>
          })}
          </>
          }

</>}

      
    </ul>
      {searchError  && <div className="flex justify-center">
        <div role="status" aria-live="polite" className="text-primary-600 pb-4">{searchError && <strong>{searchError?.status}</strong>} Det har oppstått en feil</div>
      </div>
        }

    </>
    )
}
