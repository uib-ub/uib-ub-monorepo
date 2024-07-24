'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useContext } from "react"
import { SearchContext } from '@/app/search-provider'
import Spinner from '@/components/svg/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import Pagination from '@/components/results/pagination'





export default function TableView() {
    const searchParams = useSearchParams()

    const { resultData, isLoading, searchError } = useContext(SearchContext)
    const router = useRouter()
    const params = useParams()

    const mapViewUrl = `/view/${params.dataset}${searchParams.toString() ? '?' + searchParams.toString() : ''}`




    return (
            <div  className='flex flex-col my-2 gap-y-4 h-full'>
                {searchError ? <ErrorMessage error={searchError} message="Kunne ikke gjennomføre søket"/>
                    
                
            :

            resultData?.hits?.hits?.length ?
            <>
            <div className='flex  flex-col gap-2 !mx-2'>
            <div>
            <button className='btn btn-outline btn-compact' onClick={() => router.push(mapViewUrl)}>Kartvisning</button>
            </div>

            <table className='result-table'>
                <thead>
                    <tr>
                        <th>Stadnamn</th>
                        <th>Gardsnummer</th>
                        <th>Bruksnummer</th>
                    </tr>
                </thead>
                <tbody>
                { resultData?.hits?.hits?.map((hit: any) => (
                    <tr key={hit._id}>
                        <td>{hit._source.label}</td>
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
