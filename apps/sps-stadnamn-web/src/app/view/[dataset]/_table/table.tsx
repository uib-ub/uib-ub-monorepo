'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from "react"
import { SearchContext } from '@/app/search-provider'
import Pagination from '@/components/results/pagination'
import { PiCaretDown, PiCaretUp, PiDownloadSimple, PiMapTrifold } from 'react-icons/pi'
import { useQueryStringWithout } from '@/lib/search-params'
import InfoButton from '@/components/results/infoButton'
import { miscSettings, facetConfig } from '@/config/search-config'
import SortButton from './SortButton'
import ExternalLinkButton from '@/components/results/externalLinkButton'
import ResultRow from '../@searchSection/ResultRow'





export default function TableExplorer() {
    const searchParams = useSearchParams()

    const { resultData } = useContext(SearchContext)
    const router = useRouter()
    const params = useParams()

    const mapViewParams = useQueryStringWithout(["display"])
    const mapViewUrl = `/view/${params.dataset}${mapViewParams ? '?' + mapViewParams : ''}`
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const [columns, setColumns] = useState<string[]>([])

    const showAdm = searchParams.getAll('adm').length != 1

    

    


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
                            <SortButton field="label.keyword">
                            Oppslag
                            </SortButton>
                        </th>
                        {
                            showAdm && <th> 
                                <SortButton field="adm1.keyword,adm2.keyword">
                                Distrikt
                                </SortButton>
                            </th>
                        }
                        { facetConfig[params.dataset as string]?.map((facet: any) => (
                            <th key={facet.key}>
                                <SortButton field={facet.type ? facet.key : facet.key + ".keyword"}>
                                    {facet.label}
                                </SortButton>
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                { resultData?.hits?.hits?.map((hit: any) => (
                    <tr key={hit._id}>
                        <td>
                           <ResultRow hit={hit} adm={false}/>
                        </td>
                        {
                            showAdm && <td>{hit._source.adm2}, {hit._source.adm1}</td>
                        }
                        { facetConfig[params.dataset as string]?.map((facet: any) => (
                            facet.key.includes("__") ? 
                                <td key={facet.key}>
                                    {[...new Set(hit._source[facet.key.split("__")[0]]
                                        .map((k: Record<string, any>) => k[facet.key.split("__")[1]] || '-'))]
                                        .join(', ')}
                                </td>
                            :
                                <td key={facet.key}>
                                    {facet.key.split('.').reduce((o: Record<string, any> | undefined, k: string) => (o || {})[k], hit._source) || '-'}
                                </td>
                        ))}
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
