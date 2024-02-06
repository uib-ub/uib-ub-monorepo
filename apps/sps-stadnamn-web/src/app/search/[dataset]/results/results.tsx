import Pagination from './pagination'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Hits } from '../types'
  interface ResultsProps {
    hits: Hits;
  }

export default function Results({ hits }: ResultsProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const documentUrl = (uuid: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('document', String(uuid))
        return pathname + "?" + params.toString()
    }


  return (
    <section className='flex flex-col gap-2'>
    <h2 className='text-xl font-semibold'>Treff: { (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</h2>
    <section className='md:rounded-sm md:py-1'>

    <ul className='flex flex-col gap-1 mb-2'>
      {hits.hits.map(hit => (
        <li key={hit._id} className="my-0 rounded-sm py-2 flex-grow border-t last:border-b border-neutral-400"><Link className="no-underline font-semibold" href={documentUrl(hit._id)}>{hit._source.label}</Link> | {hit._source.rawData.kommuneNamn}
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