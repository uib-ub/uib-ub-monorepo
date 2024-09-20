'use client'  
import { datasetTitles } from '@/config/metadata-config';
import TreeViewResults from './tree-view-results';
import { PiCaretRightBold } from 'react-icons/pi';
import { treeSettings } from '@/config/server-config';
import { useParams, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import SearchParamsLink from '@/components/ui/search-params-link';
import { SearchContext } from '@/app/search-provider';
import { getSkeletonLength } from '@/lib/utils';



export default function TreeView() {
  const searchParams = useSearchParams()
  const params = useParams()
  const [cadastralData, setCadastralData] = useState<any>(null)

  const { resultData, isLoading, searchError } = useContext(SearchContext)

  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false)

// Todo: adapt to datasets with adm3
const adm1 = searchParams.get('adm1')
const adm2 = searchParams.get('adm2')

const aggregate = adm2 ? undefined : adm1 ? 'adm2' : 'adm1'
const aggSort = treeSettings[params.dataset as string]?.aggSort


useEffect(() => {
  if (aggregate) {
    setIsLoadingTree(true)

    fetch(`/api/tree?dataset=${params.dataset}${adm1 ? `&adm1=${adm1}` : ''}${adm2 ? `&adm2=${adm2}` : ''}`)
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

    
}, [params.dataset, adm1, adm2, aggregate])



    return <section className="'absolute xl:static z-[2002] flex-col w-full top-0 bottom-0 h-full overflow-y-auto border-t border-neutral-200 pt-4 xl:pt-0 xl:border-none hidden max-h-full overflow-hidden" 
                    style={{display: searchParams.get('search') == 'hide' ? 'none' : 'flex'}}>
     
        {adm1 && 
          <div className="px-4 py-2 text-lg">
            <SearchParamsLink className="breadcrumb-link" withoutParams={["adm1", "adm2"]}>
            {datasetTitles[params.dataset as string]}
            </SearchParamsLink>
            <span className='mx-2'>/</span>
            {adm2 ?
              <>
              <SearchParamsLink className="breadcrumb-link" withoutParams={["adm2"]}>
              {adm1}
              </SearchParamsLink>
              <span className='mx-2'>/</span>
              {adm2}
              </>
            : adm1
            }
          </div>
        }
        { isLoadingTree && <div className='border-t-2 border-neutral-100 border-neutral-300 pt-2 animate-pulse'>
          <div role="status" aria-live="polite" className="sr-only">Laster inn register</div>
          { Array.from({length: 20}, (_, i) => <div key={i} className="flex px-2 py-2 border-b border-neutral-300 mx-2">
            <div className="rounded-md my-2  bg-neutral-200 h-[1em]" style={{width: `${getSkeletonLength(i, 4, 16)}rem`}}></div>
          </div>) }

        </div> }

          {cadastralData?.aggregations?.adm?.buckets?.length &&
          <ul className="flex-col gap-2 overflow-y-auto stable-scrollbar">
          {aggregate && !isLoadingTree && cadastralData?.aggregations.adm.buckets
                  .filter((item: any) => item.key != '_false')
                  .sort((a: any, b: any)=> aggSort ? a.aggNum.buckets[0].key.localeCompare(b.aggNum.buckets[0].key) : a.aggNum.localeCompare(b.key))
                  .map((adm: Record<string, any>) => {

            return <li key={adm.key} className="flex flex-col gap-2">
              <SearchParamsLink addParams={{[adm1 ? 'adm2' : 'adm1']: adm.key}}
                    className="lg:text-lg gap-2 px-4 mx-2 py-2 border-b border-neutral-300 no-underline">
                      {treeSettings[params.dataset as string].showNumber && (adm1 ? adm.aggNum.buckets[0].key : adm.aggNum.buckets[0].key.slice(0,2))} {adm.key}
                      <PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/>
              </SearchParamsLink>
            </li>
          })}
          </ul>
          }

        {!aggregate ?
        
        <TreeViewResults hits={resultData?.hits} isLoading={isLoading}/>
        : null
        }
    </section>
    
  
}



