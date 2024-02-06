import Pagination from './pagination'
import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation';
import { PiMapPinFill, PiInfoFill } from 'react-icons/pi';
import AudioButton from './audioButton';
  interface ResultsProps {
    hits: Hits;
  }

export default function Results({ hits }: ResultsProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()


    const viewUrl = (uuid: string, view: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('document', String(uuid))
      params.set('view', String(view))
      return pathname + "?" + params.toString()
  }


  return (
    <section className='flex flex-col gap-2'>
    <h2 className='text-xl font-semibold'>Treff: { (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</h2>
    <section className='md:rounded-sm md:py-1'>

    <ul className='flex flex-col gap-1 mb-2'>
      {hits.hits.map(hit => (
        <li key={hit._id} className="my-0 rounded-sm py-2 flex-grow border-t last:border-b border-neutral-400"><span className="no-underline font-semibold">{hit._source.label}</span> | {hit._source.rawData.kommuneNamn}
        <div className='flex gap-1 float-right ml-2'>
        
        {hit._source.audio && 
          <AudioButton audioFile={'https://iiif.test.ubbe.no/iiif/audio/hord/' + hit._source.audio.file } className="text-2xl text-neutral-700"/> 
        }
        {hit._source.location && 
          <Link href={viewUrl(hit._id, 'map')} className="p-1"><PiMapPinFill className="text-2xl text-neutral-600"/></Link> 
        }
        <Link href={viewUrl(hit._id, 'info')} className="p-1"><PiInfoFill className="text-2xl text-primary-600"/></Link>
        </div>
        <p>
          {hit._source.rawData.merknader}
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