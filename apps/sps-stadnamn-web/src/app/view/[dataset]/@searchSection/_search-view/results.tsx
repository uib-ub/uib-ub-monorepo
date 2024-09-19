import Pagination from '../../../../../components/results/pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiTable } from 'react-icons/pi';
import ResultRow from '@/components/results/ResultRow';


export default function Results({ hits }: { hits: any}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()


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

    // When sort options aren't configured yet, we can sort by relevance or alphabetically using a single toggle
    const sortOrderByCombined = () => {
      const params = new URLSearchParams(searchParams)
      if (searchParams.get('sort') == 'asc') {
        params.set('sort', 'desc')
      } else if (searchParams.get('sort') == 'desc') {
        params.delete('sort')
      }
      else {
        params.set('sort', 'asc')
      }

      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }


    const openTableView = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('display')
      newSearchParams.delete('search') // Hide search bar section on mobile devices
      router.push(`/view/${params.dataset}?display=table&${newSearchParams.toString()}`)
    }



  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-4 gap-2 flex-wrap">
      <h2 id="result_heading" aria-live="polite">
      <span className='text-xl text-center h-full font-semibold small-caps'>
        Treff&nbsp;
        </span> 
        <span className='text-sm bg-neutral-100 rounded-full px-2'>{ (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</span>
      </h2>
      <div className="ml-auto flex items-end gap-4">
      { searchParams.get('display') != 'table' &&
        <button className="btn btn-outline btn-compact !pl-2" onClick={openTableView}>
      <i>
        <PiTable className="text-xl mr-2" aria-hidden="true"/>
      </i>
      Tabellvisning
      </button>}
    </div>
    </span>
    <section id="result_list" className="lg:py-1 mx-2">
    <ul className='flex flex-col gap-1 mb-2 divide-y divide-neutral-400'>
      {hits.hits.map((hit: any) => (
        <ResultRow key={hit._source.uuid} hit={hit}/>
      ))}
    </ul>


    <nav className="center gap-2 mt-4">
      {hits.total.value > 10 && <Pagination totalPages={Math.ceil(hits.total.value / (Number(searchParams.get('size')) || 10))}/>}
    </nav>

    </section>
    </section>
    )
}