import { SearchContext } from "@/app/simple-search-provider"
import { useContext } from "react"

import Pagination from "../results/pagination";
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending, PiArticleFill, PiLinkBold, PiCaretUp, PiCaretDown } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import AudioButton from "../results/audioButton";
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/dataset-render-config';
import { sortConfig, datasetTitles } from '@/config/dataset-config';
import Spinner from '@/components/svg/Spinner';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";



export default function Results() {
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
    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details
    const [ showLoading, setShowLoading ] = useState<boolean>(true)
    const { resultData, totalHits, isLoading } = useContext(SearchContext)

    const from = useQueryState('from', parseAsInteger)[0]


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
    <section id="result_list" className={`lg:py-1 ml-1 ${isOpen ? 'block' : 'hidden md:block'}`}>

    <ul className='flex flex-col mb-2 divide-y divide-neutral-400'>
      {resultData?.map((hit: any, index:number) => (
        <li key={hit._id} className="my-0 flex flex-grow">
        <Link className="w-full h-full py-2 px-2 hover:bg-neutral-50 no-underline" href={serialize(new URLSearchParams(searchParams), {doc: hit._source.uuid, ...hit._source.location ? {center: hit._source.location.coordinates} : {}})}>
        <strong className="text-primary-600">{titleRenderer(hit)}</strong>
        <p>
          { detailsRenderer(hit) }
        </p>
        </Link>
       
        </li>
      ))}
    </ul>


    <nav className="center gap-2">
      {totalHits?.value > 10 && <Link href={serialize(new URLSearchParams(searchParams), {size: parseInt(searchParams.get('size') ||'20'), from: from ? from + parseInt(searchParams.get('size') ||'20') : parseInt(searchParams.get('size') ||'20')})}>Next page</Link>}
    </nav>

    </section>
    </section>
    )
}
