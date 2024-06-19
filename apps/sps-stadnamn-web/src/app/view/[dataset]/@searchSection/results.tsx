import Pagination from '../../../../components/results/pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending, PiArticleFill, PiLinkBold, PiCaretUp, PiCaretDown, PiPlusCircleFill } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import AudioButton from '../../../../components/results/audioButton';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { sortConfig } from '@/config/search-config';
import { datasetTitles } from '@/config/metadata-config';
import Spinner from '@/components/svg/Spinner';
import ResultRow from './ResultRow';


export default function Results({ hits, isLoading }: { hits: any, isLoading: boolean}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()
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



  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-2 gap-2 flex-wrap">
      <h2 id="result_heading" aria-live="polite">
      <span className='text-xl text-center h-full font-semibold small-caps'>
        Treff
        </span> { showLoading ? <Spinner className='inline w-[1em] h-[1em}'/> : <span className='text-sm bg-neutral-100 rounded-full px-2'>{ (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</span> }
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
    <section id="result_list" className="lg:py-1 ml-1">
    <ul className='flex flex-col gap-1 mb-2 divide-y divide-neutral-400'>
      {hits.hits.map((hit: any) => (
        <ResultRow key={hit._source.uuid} hit={hit}/>
      ))}
    </ul>


    <nav className="center gap-2">
      {hits.total.value > 10 && <Pagination totalPages={Math.ceil(hits.total.value / (Number(searchParams.get('size')) || 10))}/>}
    </nav>

    </section>
    </section>
    )
}