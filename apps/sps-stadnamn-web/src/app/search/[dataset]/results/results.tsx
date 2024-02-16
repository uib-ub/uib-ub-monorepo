import Pagination from './pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending, PiArticleFill} from 'react-icons/pi';
import AudioButton from './audioButton';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';


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

    const goToView = (uuid: string, view: string, manifest?: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('document', String(uuid))
      params.set('view', String(view))
      if (manifest) {
        params.set('manifest', String(manifest))
      }
      router.push(pathname + "?" + params.toString())
  }


  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-2">
      <h2 id="result_heading" aria-live="polite" className='text-2xl small-caps font-semibold'>Treff: { (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</h2>
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
        <li key={hit._id} className="my-0 rounded-sm py-2 px-2 flex flex-grow border-t last:border-b border-neutral-400">
        <div className=''><Link href="/" className="no-underline font-semibold">{hit._source.label}</Link> | {hit._source.adm2} 
        <p>
          {hit._source.rawData?.merknader || hit._source.rawData?.komm }
        </p>
        </div>
        <div className='flex gap-1 ml-auto items-end'>

        {hit._source.image && 
          <IconButton 
            onClick={() => goToView(hit._id, 'image', hit._source.image.manifest)} 
            label="Vis seddel" 
            aria-current={searchParams.get('document') == hit._id && searchParams.get('view') == 'image' ? 'page': undefined}
            className="p-1 text-neutral-700">
              <PiArticleFill className="text-xl xl:text-3xl"/></IconButton> 
        }
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${hit._source.audio.file}` } 
                       className="text-xl xl:text-3xl text-neutral-700"/> 
        }
        {hit._source.location && 
          <IconButton 
            onClick={() => goToView(hit._id, 'map')} 
            label="Vis i kart" 
            aria-current={searchParams.get('document') == hit._id && searchParams.get('view') == 'map' ? 'page': undefined} 
            className="p-1 text-neutral-700">
              <PiMapPinFill className="text-xl xl:text-3xl"/></IconButton> 
        }
        <IconButton 
          onClick={() => goToView(hit._id, 'info')} 
          label="Vis infoside" 
          aria-current={searchParams.get('document') == hit._id && searchParams.get('view') == 'info' ? 'page': undefined} 
          className="p-1 text-primary-600">
            <PiInfoFill className="text-xl xl:text-3xl"/></IconButton>
        </div>
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