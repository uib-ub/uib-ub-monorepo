'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useContext, useState } from "react"
import { SearchContext } from '@/app/search-provider'
import Pagination from '@/components/results/pagination'
import { PiCaretDown, PiCaretUp, PiDownloadSimple, PiMapTrifold, PiSortAscending, PiSortDescending } from 'react-icons/pi'
import { useQueryStringWithout } from '@/lib/search-params'
import InfoButton from '@/components/results/infoButton'
import { miscSettings } from '@/config/search-config'





export default function TableExplorer() {
    const searchParams = useSearchParams()

    const { resultData } = useContext(SearchContext)
    const router = useRouter()
    const params = useParams()

    const mapViewParams = useQueryStringWithout(["display"])
    const mapViewUrl = `/view/${params.dataset}${mapViewParams ? '?' + mapViewParams : ''}`
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const [columns, setColumns] = useState<string[]>([])

    const sortToggle = (field: string) => {
        const newParams = new URLSearchParams(searchParams)

        newParams.delete('page')
        
        if (newParams.get('asc') == field) {
            newParams.delete('asc')
            newParams.set('desc', field)
        }
        else if (newParams.get('desc') == field) {
            newParams.delete('desc')
        }
        else if (newParams.get('asc') != field) {
            newParams.delete('asc')
            newParams.delete('desc')
            newParams.set('asc', field)
        }
        



        router.push(`/view/${params.dataset}?${newParams.toString()}`)
    }







    return (
            <div  className='flex flex-col my-2 gap-y-4 h-full'>
            <div className='flex  flex-col gap-4 !mx-2'>
            <div className='flex gap-2 mt-2 xl:mt-0'>
            { miscSettings[params.dataset as string]?.display != 'table' &&
                <button className='btn btn-outline btn-compact pl-2' onClick={() => router.push(mapViewUrl)}>
                <PiMapTrifold className='text-xl mr-2' aria-hidden="true"/>
                Kartvisning
            </button> }
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
                        <th>
                            <button onClick={() => sortToggle('label.keyword')}>
                            Stadnamn
                            {
                                searchParams.get('asc') == 'label.keyword' && <PiSortAscending className='text-xl inline ml-2'/>
                            }
                            {
                                searchParams.get('desc') == 'label.keyword' && <PiSortDescending className='text-xl inline ml-2'/>
                            }
                            </button>


                        </th>
                        <th>
                            <button onClick={() => sortToggle('sosi.keyword')}>
                            Lokalitetstype
                            {
                                searchParams.get('asc') == 'sosi.keyword' && <PiSortAscending className='text-xl inline ml-2'/>
                            }
                            {
                                searchParams.get('desc') == 'sosi.keyword' && <PiSortDescending className='text-xl inline ml-2'/>
                            }
                            </button>

                        </th>
                        <th>Gardsnummer</th>
                        <th>Bruksnummer</th>
                    </tr>
                </thead>
                <tbody>
                { resultData?.hits?.hits?.map((hit: any) => (
                    <tr key={hit._id}>
                        <td>
                            <InfoButton doc={hit} iconClass='text-2xl align-top text-primary-600 inline'/>
                            
                            {hit._source.label}</td>
                        <td>{hit._source.sosi}</td>
                        <td>{hit._source.cadastre?.[0].gnr || '-'}</td>
                        <td>{hit._source.cadastre?.[0].bnr || '-'}</td>
                    </tr>
                ))
            }
                
            


                </tbody>
            </table>
            
            
            </div>
            <nav className="center gap-2 mx-2 pb-4">
            {resultData?.hits?.total.value > 10 && <Pagination totalPages={Math.ceil(resultData?.hits.total.value / (Number(searchParams.get('size')) || 10))}/>}
            </nav>
            
            </div>
            
          
            )
    

    
}
