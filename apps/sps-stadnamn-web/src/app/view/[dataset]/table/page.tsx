'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useContext, useState } from "react"
import { SearchContext } from '@/app/search-provider'
import Spinner from '@/components/svg/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import Pagination from '@/components/results/pagination'
import { PiCaretDown, PiCaretUp, PiDownloadSimple, PiMapTrifold, PiPlus } from 'react-icons/pi'





export default function TableView() {
    const searchParams = useSearchParams()

    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const router = useRouter()
    const params = useParams()

    const mapViewUrl = `/view/${params.dataset}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const [columns, setColumns] = useState<string[]>([])




    return (
            <div  className='flex flex-col my-2 gap-y-4 h-full'>
                {searchError ? <ErrorMessage error={searchError} message="Kunne ikke gjennomføre søket"/>
                    
                
            :

            resultData?.hits?.hits?.length ?
            <>
            <div className='flex  flex-col gap-2 !mx-2'>
            <div className='flex gap-2'>
            <button className='btn btn-outline btn-compact pl-2' onClick={() => router.push(mapViewUrl)}>
                <PiMapTrifold className='text-xl mr-2' aria-hidden="true"/>
                Kartvisning
            </button>
            <button className='btn btn-outline btn-compact pl-2' onClick={() => router.push(mapViewUrl)}>
                <PiDownloadSimple className='text-xl mr-2' aria-hidden="true"/>
                Last ned
            </button>
            <button className='btn btn-outline btn-compact pl-2' onClick={() => setColumnSelectorOpen(!columnSelectorOpen)} aria-expanded={columnSelectorOpen} aria-controls={columnSelectorOpen ? 'column-selector' : undefined}>
                { columnSelectorOpen ? <PiCaretUp className='text-xl mr-2' aria-hidden="true"/> : <PiCaretDown className='text-xl mr-2' aria-hidden="true"/> }           
                Kolonner
            </button>
            </div>
            { columnSelectorOpen && <div className='flex gap-2' id="column-selector">
                <input type="checkbox" id="label" name="label" value="label" checked={columns.includes('label')} onChange={(e) => setColumns(e.target.checked ? [...columns, 'label'] : columns.filter(c => c !== 'label') )}/>
                <label htmlFor="label">Stadnamn</label>
                <input type="checkbox" id="gnr" name="gnr" value="gnr" checked={columns.includes('gnr')} onChange={(e) => setColumns(e.target.checked ? [...columns, 'gnr'] : columns.filter(c => c !== 'gnr') )}/>
                <label htmlFor="gnr">Gnr</label>
                <input type="checkbox" id="bnr" name="bnr" value="bnr" checked={columns.includes('bnr')} onChange={(e) => setColumns(e.target.checked ? [...columns, 'bnr'] : columns.filter(c => c !== 'bnr') )}/>
                <label htmlFor="bnr">Bnr</label>
            </div>


            }

            <table className='result-table'>
                <thead>
                    <tr>
                        <th>Stadnamn</th>
                        <th>Lokalitetstype</th>
                        <th>Gardsnummer</th>
                        <th>Bruksnummer</th>
                    </tr>
                </thead>
                <tbody>
                { resultData?.hits?.hits?.map((hit: any) => (
                    <tr key={hit._id}>
                        <td>{hit._source.label}</td>
                        <td>{hit._source.sosi}</td>
                        <td>{hit._source.cadastre?.[0].gnr || '-'}</td>
                        <td>{hit._source.cadastre?.[0].bnr || '-'}</td>
                    </tr>
                ))
            }
                
            


                </tbody>
            </table>
            
            
            </div>
            <nav className="center gap-2 mx-2">
            {resultData?.hits?.total.value > 10 && <Pagination totalPages={Math.ceil(resultData?.hits.total.value / (Number(searchParams.get('size')) || 10))}/>}
            </nav>
            
            </>

            
             :
             isLoading ?
                <div className="flex h-full items-center justify-center">
                <div>
                  <Spinner status="Laster inn kartet" className="w-20 h-20"/>
                </div>
              </div> 
              :
                <div className="flex h-full flex-col items-center justify-center my-auto text-2xl gap-y-1 font-semibold" role="status" aria-live="polite"><div>Ingen treff</div></div>}
            
            </div>
            
  
          
            
          
            )
    

    
}
