import Pagination from './pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending} from 'react-icons/pi';
import AudioButton from './audioButton';
import IconButton from '@/components/ui/icon-button';


export default function Results({ hits }: { hits: any }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()

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

    const goToView = (uuid: string, view: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('document', String(uuid))
      params.set('view', String(view))
      router.push(pathname + "?" + params.toString())
  }


  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-4">
      <h2 id="result_heading" aria-live="polite" className='text-xl font-semibold'>Treff: { (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</h2>
      <span className="ml-auto">
      <label>Sorter etter: </label>
      <select name="orderBy">
        <option value="">relevans</option>
        <option value="label">stadnamn</option>
        <option value="adm2">kommune</option>
      </select>
      { searchParams.get('orderBy') ?
      <IconButton className="ml-auto text-xl" label={searchParams.get('sort') == 'desc'? 'Sorter synkende' : 'Sorter stigende'} onClick={sortResults}>{searchParams.get('sort') == 'desc'? <PiSortDescending/> : <PiSortAscending/> }</IconButton>
      : null
      }
    </span>
    </span>
    <section className='lg:rounded-sm lg:py-1'>

    <ul className='flex flex-col gap-1 mb-2'>
      {hits.hits.map((hit: any) => (
        <li key={hit._id} className="my-0 rounded-sm py-2 px-4 flex-grow border-t last:border-b border-neutral-400"><span className="no-underline font-semibold">{hit._source.label}</span> | {hit._source.adm2}
        <div className='flex gap-1 float-right ml-2'>
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${hit._source.audio.file}` } className="text-xl xl:text-3xl text-neutral-700"/> 
        }
        {hit._source.location && 
          <IconButton onClick={() => goToView(hit._id, 'map')} label="Vis i kart" className="p-1"><PiMapPinFill className="text-xl xl:text-3xl text-neutral-600"/></IconButton> 
        }
        <IconButton onClick={() => goToView(hit._id, 'info')} label="Vis infoside" className="p-1"><PiInfoFill className="text-xl xl:text-3xl text-primary-600"/></IconButton>
        </div>
        <p>
          {hit._source.rawData?.merknader}
        </p>
        
        </li>
      ))}
    </ul>


    </section>

    <nav className="center gap-2">

      {hits.total.value > 10 && <Pagination totalPages={Math.ceil(hits.total.value / (Number(searchParams.get('size')) || 10))}/>}

    </nav>
    </section>
    )
}