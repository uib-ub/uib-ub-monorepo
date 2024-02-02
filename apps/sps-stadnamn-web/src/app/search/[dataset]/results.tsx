import Pagination from './pagination'
import { useSearchParams } from 'next/navigation';
import { ResultData } from './types'
  interface ResultsProps {
    resultData: ResultData;
  }

export default function Results({ resultData }: ResultsProps) {
const searchParams = useSearchParams()
  return (
    <>
    <span>{ resultData?.total?.value || 'Ingen' } treff</span>
    <section className='md:border md:border-slate-300 md:rounded-sm md:py-1 md:h-auto overflow-y-auto'>

    
    <ul className='flex flex-col gap-1 overflow-auto md:mx-1'>
      {resultData.hits.map(hit => (
        <li key={hit._id} className="my-0 border rounded-sm p-2 flex-grow"><strong>{hit._source.label}</strong> | {hit._source.rawData.kommuneNamn}</li>
      ))}
    </ul>


    </section>

    <nav className="center gap-2">

      {resultData.total.value > 10 && <Pagination totalPages={Math.ceil(resultData.total.value / (Number(searchParams.get('size')) || 10))}/>}

    </nav>
    </>
    )
}