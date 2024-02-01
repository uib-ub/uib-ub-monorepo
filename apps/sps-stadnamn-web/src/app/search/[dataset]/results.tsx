import Pagination from './pagination'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { ResultData } from './types'
  interface ResultsProps {
    resultData: ResultData;
  }

export default function Results({ resultData }: ResultsProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter();
    const documentUrl = (uuid: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('document', String(uuid))
        return pathname + "?" + params.toString()
    }


  return (
    <>
    <h2 className='text-lg'>Treff: { (resultData.total.value || '0')  + (resultData.total.value == 10000 ? "+" : '')}</h2>
    <section className='md:rounded-sm md:py-1 md:h-auto overflow-y-auto'>

    <ul className='flex flex-col gap-1 overflow-auto mb-2'>
      {resultData.hits.map(hit => (
        <li key={hit._id} className="my-0 rounded-sm py-2 flex-grow border-t last:border-b border-slate-400"><Link className="no-underline font-semibold" href={documentUrl(hit._id)}>{hit._source.label}</Link> | {hit._source.rawData.kommuneNamn}
        </li>
      ))}
    </ul>


    </section>

    <nav className="center gap-2">

      {resultData.total.value > 10 && <Pagination totalPages={Math.ceil(resultData.total.value / (Number(searchParams.get('size')) || 10))}/>}

    </nav>
    </>
    )
}