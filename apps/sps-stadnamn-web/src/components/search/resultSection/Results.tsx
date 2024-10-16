import { SearchContext } from "@/app/map-search-provider"
import { useContext } from "react"
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiSortAscending, PiSortDescending, PiCaretUp, PiCaretDown } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { sortConfig } from '@/config/dataset-config';
import Spinner from '@/components/svg/Spinner';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import ResultItem from "./ResultItem";
import { useSearchQuery } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";


export default function Results({setSelectedDoc}: {setSelectedDoc: any}) {
    const searchParams = useSearchParams()
    const serialize = createSerializer({
        from: parseAsInteger,
        size: parseAsInteger,
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
    });

    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()
    const [isOpen, setIsOpen] = useState(false)
    const [ showLoading, setShowLoading ] = useState<boolean>(true)
    const { resultData, totalHits, isLoading, searchError} = useContext(SearchContext)
    const [additionalItems, setAdditionalItems] = useState<any[]>([])
    const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(20))
    const { searchQueryString } = useSearchQuery()



    useEffect(() => {
      if (!isLoading) {
        setTimeout(() => {
          setShowLoading(false)
        }, 100);
      }
      else {
        setShowLoading(true)
      }
    }
    , [isLoading])


    const sortResults = () => {
      const params = new URLSearchParams(searchParams)
      if (searchParams.get('sort') == 'desc') {
        params.delete('sort')
      } else {
        params.set('sort', 'desc')
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }

    const orderBy = (e: any) => {
      const params = new URLSearchParams(searchParams)
      if (e.target.value == '') {
        params.delete('orderBy')
      } else {
        params.set('orderBy', e.target.value)
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }


    
    useEffect(() => {
      if (size > 20) {
        const newParams = new URLSearchParams(searchQueryString)
        newParams.set('size', (size - 20).toString())
        newParams.set('from', '20')
        console.log("QUERY", `http://localhost:3000/api/search/map?${newParams.toString()}`)
        fetch(`/api/search/map?${newParams.toString()}`).then(response => response.json()).then(es_data => {
          // Add conditionally to account for double fetches in nextjs strict mode
          setAdditionalItems(es_data.hits?.hits)
            

        }

        )
      }
    }, [size, searchQueryString])

     




  const ResutlsTitle = () => {
    return <>
    <span className='text-xl text-center h-full font-semibold small-caps'>
      Treff
      </span> { showLoading ? <Spinner status="Laster søkeresultater" className='inline w-[1em] h-[1em}'/> : <span className='text-sm bg-neutral-100 rounded-full px-2'>{ (totalHits?.value || '0')  + (totalHits?.value == 10000 ? "+" : '')}</span> }
    </>
  }


  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-2 gap-2 flex-wrap">
      <h2 id="result_heading" aria-live="polite">
        <button type="button" className="flex gap-2 items-center flex-nowrap md:hidden" onClick={() => setIsOpen(!isOpen)} aria-controls="result_list" aria-expanded={isOpen}>
          { isOpen? 
            <PiCaretUp aria-hidden={true} className="md:hidden"/>
            :
            <PiCaretDown aria-hidden={true} className="md:hidden"/> }
        <ResutlsTitle/>

        </button>
        <span className='hidden md:inline'><ResutlsTitle/></span>

      </h2>
      <div className="ml-auto flex items-end gap-4">
      {sortConfig[params.dataset] && 
      <span>
        <label className="sr-only" htmlFor="sort_select">Sorter etter: </label>
        <select id="sort_select" form="searchForm" name="orderBy" onChange={orderBy} value={searchParams.get('orderBy') || undefined}>
          <option value="">relevans</option>
          {sortConfig[params.dataset].map((sort: any) => (
            <option key={sort.key} value={sort.key}>  {sort.label}</option>
          ))}
        </select>
      </span>
    }

      <IconButton label={searchParams.get('sort') == 'desc'? 'Sorter synkende' : 'Sorter stigende'} onClick={sortResults}>{searchParams.get('sort') == 'desc'? <PiSortDescending className='text-xl'/> : <PiSortAscending className=' text-xl'/> }</IconButton>

      
    </div>
    </span>


    <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-400'>
      {resultData?.map((hit: any) => (
        <ResultItem key={hit._id} hit={hit} setSelectedDoc={setSelectedDoc}/>
      ))}


{totalHits && totalHits.value > resultData.length && <>
  {Array.from({length: Math.min(totalHits.value - resultData.length, size - resultData.length) 
    + (totalHits.value > size ? 1 : 0)
  }, (_, i) => {
    if (i == size - resultData.length && totalHits.value > size) {
      return <li className="w-full flex justify-center py-4" key="load-more">
                <Link className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline" href={serialize(new URLSearchParams(searchParams), {size: size + 40})}>Vis flere</Link>
              </li>
    }
    else {
      const hit = additionalItems?.[i];
      if ( hit) {
        return <ResultItem debugIndex={i} key={hit._id} hit={hit} setSelectedDoc={setSelectedDoc}/>
      }
      else {
        return <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
        </li>
      }
    }
  }
  )}
</>}

      
    </ul>
      
      {searchError ? <div className="flex justify-center">
        <div role="status" aria-live="polite" className="text-primary-600"><strong>{searchError.status}</strong> Det har oppstått en feil</div>
      </div>
      : !isLoading && !resultData?.length &&  <div className="flex justify-center">
      <div role="status" aria-live="polite" className="text-neutral-950">Ingen søkeresultater</div>
    </div>}
    </section>
    )
}
