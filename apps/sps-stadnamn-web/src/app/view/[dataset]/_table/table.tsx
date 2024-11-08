'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useContext, useEffect, useState, Fragment } from "react"
import { SearchContext } from '@/app/search-provider'
import Pagination from '@/components/results/pagination'
import { PiArrowCounterClockwise, PiCaretDown, PiCaretUp, PiDownloadSimple, PiMapTrifold } from 'react-icons/pi'
import { useQueryStringWithout } from '@/lib/search-params'
import { facetConfig } from '@/config/search-config'
import { contentSettings } from '@/config/server-config';
import SortButton from './SortButton'
import ResultRow from '@/components/results/ResultRow'
import GroupedChildren from '../../../../components/results/grouped-children'


export default function TableExplorer() {
    const searchParams = useSearchParams()

    const { resultData } = useContext(SearchContext)
    const router = useRouter()
    const params = useParams()

    const mapViewParams = useQueryStringWithout(["display"])
    const mapViewUrl = `/view/${params.dataset}${mapViewParams ? '?' + mapViewParams : ''}`
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState<string[]>([])
    const localStorageKey = `visibleColumns_${params.dataset as string}`;
    const [expandLoading, setExpandLoading] = useState<boolean>(false)
    

    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[params.dataset as string]?.cadastre

    const resetSort = () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('asc')
        newSearchParams.delete('desc')
        router.push(`/view/${params.dataset}?${newSearchParams.toString
        ()}`)
    }


    function formatCadastre(cadastre: Record<string, any>[]): string {
        return cadastre.map(item => {
            if (Array.isArray(item.gnr)) {
                if (item.gnr.length > 1) {
                    return `${item.gnr[0]}-${item.gnr[1]}`;
                } else {
                    return `${item.gnr[0]}`;
                }
            } else if (item.bnr) {
                if (Array.isArray(item.bnr)) {
                    // Sort bnr to ensure correct range identification
                    const sortedBnr = item.bnr.sort((a, b) => a - b);
                    const ranges = [];
                    let start = sortedBnr[0];
                    let end = start;
    
                    for (let i = 1; i < sortedBnr.length; i++) {
                        if (sortedBnr[i] === end + 1) {
                            end = sortedBnr[i];
                        } else {
                            if (start === end) {
                                ranges.push(`${item.gnr}/${start}`);
                            } else {
                                ranges.push(`${item.gnr}/${start}-${end}`);
                            }
                            start = sortedBnr[i];
                            end = start;
                        }
                    }
    
                    // Handle the last range or number
                    if (start === end) {
                        ranges.push(`${item.gnr}/${start}`);
                    } else {
                        ranges.push(`${item.gnr}/${start}-${end}`);
                    }
    
                    return ranges.join(', ');
                } else {
                    return `${item.gnr}/${item.bnr}`;
                }
            } else {
                return `${item.gnr}`;
            }
        }).join(', ');
    }


    useEffect(() => {
        const storedColumns = localStorage.getItem(localStorageKey);
        if (storedColumns) {
          setVisibleColumns(JSON.parse(storedColumns));
        } else {
          const columns = facetConfig[params.dataset as string]?.filter(item => item.table).map(facet => facet.key) || []
          if (contentSettings[params.dataset as string]?.adm) {
            columns.unshift('adm')
          }
          if (contentSettings[params.dataset as string]?.cadastre) {
            columns.push('cadastre')
          }
          setVisibleColumns(columns);
        }
        
      }, [params.dataset, localStorageKey]);
    
      const handleCheckboxChange = (columnId: string, isChecked: boolean) => {
        if (isChecked) {
          setVisibleColumns(prev => [...prev, columnId]);
          localStorage.setItem(localStorageKey, JSON.stringify([...visibleColumns, columnId]));

        } else {
          setVisibleColumns(prev => prev.filter(id => id !== columnId));
          localStorage.setItem(localStorageKey, JSON.stringify(visibleColumns.filter(id => id !== columnId)));
        }
      };

      const resetColumns = () => {
        const facetColumns = facetConfig[params.dataset as string]?.filter(item => item.table).map(facet => facet.key) || []
        if (contentSettings[params.dataset as string]?.adm) {
          facetColumns.unshift('adm')
        }
        if (contentSettings[params.dataset as string]?.cadastre) {
          facetColumns.push('cadastre')
        }
        setVisibleColumns(facetColumns)
        localStorage.removeItem(localStorageKey);
      }

      function getValueByKeyPath(key: string, source: Record<string, any>): any {
        let value = key.split('.').reduce((o: Record<string, any> | undefined, k: string) => (o || {})[k], source);

        if (value && key == 'datasets') {
            value = value.map((dataset: string) => dataset.toUpperCase())
        }


        if (Array.isArray(value)) {
          // Limit to 10 values
          return value.slice(0,10).join(', ') + (value.length > 10 ? '...' : '');
        }
        return value || '-';
      }

      const joinWithSlash = (adm: string|string[]) => Array.isArray(adm) ? adm.join('/') : adm;
    

    return (
            <div  className='flex flex-col py-2 gap-y-4 h-full overflow-y-auto'>
            <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
            <div className='flex gap-2 mt-2 xl:mt-0'>
            { contentSettings[params.dataset as string]?.display != 'table' &&
                <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => router.push(mapViewUrl)}>
                <PiMapTrifold className='text-xl mr-2' aria-hidden="true"/>
                Kartvisning
            </button> }
            {false && <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => router.push(mapViewUrl)}>
                <PiDownloadSimple className='text-xl mr-2' aria-hidden="true"/>
                Last ned
            </button>}
            <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => setColumnSelectorOpen(!columnSelectorOpen)} aria-expanded={columnSelectorOpen} aria-controls={columnSelectorOpen ? 'column-selector' : undefined}>
                { columnSelectorOpen ? <PiCaretUp className='text-xl mr-2' aria-hidden="true"/> : <PiCaretDown className='text-xl mr-2' aria-hidden="true"/> }           
                Kolonner
            </button>
            { // Reset button if visible columns is different from default
            visibleColumns.length !== (facetConfig[params.dataset as string]?.filter(item => item.table).length
                                                + (contentSettings[params.dataset as string]?.adm ? 1 : 0 )
                                                + (contentSettings[params.dataset as string]?.cadastre ? 1 : 0 )
                                                || 0) &&
            <button type="button" className='btn btn-outline btn-compact pl-2' onClick={resetColumns}>
                <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true"/>
                Tilbakestill kolonner
            </button>

            }
            { (searchParams.get('asc') || searchParams.get('desc')) &&
                <button type="button" className='btn btn-outline btn-compact pl-2' onClick={resetSort}>
                <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true"/>
                Tilbakestill sortering
            </button>
            }
            </div>
            
            { columnSelectorOpen && <div className='flex gap-4 px-2 flex-wrap' id="column-selector">
                { contentSettings[params.dataset as string]?.adm && <div>
                    <label className="flex gap-2">
                        <input
                        type="checkbox"
                        checked={visibleColumns.includes('adm')}
                        onChange={(e) => handleCheckboxChange('adm', e.target.checked)}
                        />
                        Område
                    </label>
                </div>}
                { contentSettings[params.dataset as string]?.cadastre && <div>
                    <label className="flex gap-2">
                        <input
                        type="checkbox"
                        checked={visibleColumns.includes('cadastre')}
                        onChange={(e) => handleCheckboxChange('cadastre', e.target.checked)}
                        />
                        Matrikkel
                    </label>
                </div>}
                {facetConfig[params.dataset as string]?.map((facet: any) => (
                    <div key={facet.key}>
                    <label className="flex gap-2">
                        <input
                        type="checkbox"
                        checked={visibleColumns.includes(facet.key)}
                        onChange={(e) => handleCheckboxChange(facet.key, e.target.checked)}
                        />
                        {facet.label}
                    </label>
                    </div>
                ))}

            </div>


            }
             <table className='result-table'>
                <thead>
                    <tr>
                        <th>
                            <SortButton field="label.keyword" label="Treff" description='Oppslagsord'/>
                        </th>
                        
                        {
                            visibleColumns.includes('adm') && <th> 
                                <SortButton field={Array.from({length: contentSettings[params.dataset as string]?.adm || 0}, (_, i) => `adm${i+1}.keyword`).join(",")} label="Område"/>
                            </th>
                        }
                        { showCadastre && visibleColumns.includes('cadastre') &&
                            <th>
                            <SortButton field='adm1.keyword,adm2.keyword,cadastre__gnr,cadastre__bnr' label="Matrikkel" description="Gnr/Bnr kommunevis"/>
                            </th>
                        }
                        { facetConfig[params.dataset as string]?.filter(item => visibleColumns.includes(item.key)).map((facet: any) => (
                            <th key={facet.key}>
                                <SortButton field={facet.type ? facet.key : facet.key + ".keyword"} label={facet.label} description={facet.description}/>
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                { resultData?.hits?.hits?.map((hit: any) => (
                    <Fragment key={hit._id}>
                    <tr>
                        <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit._source.uuid ? 'rowgroup' : 'row'}>
                           <ResultRow hit={hit} adm={false} externalLoading={expandLoading}/>
                        </th>
                        {
                            visibleColumns.includes('adm') && <td>{joinWithSlash(hit._source.adm2)}{hit._source.adm3?.length && ' - ' + joinWithSlash(hit._source.adm3)}{joinWithSlash(hit._source.adm2) && ', '}{joinWithSlash(hit._source.adm1)}</td>
                        }
                        { showCadastre && visibleColumns.includes('cadastre') &&
                            <td>
                                {hit._source.cadastre && formatCadastre(hit._source.cadastre)}
                            </td>
                        }
                        { facetConfig[params.dataset as string]?.filter(item => visibleColumns.includes(item.key)).map((facet: any) => (
                            facet.key.includes("__") ? 
                                <td key={facet.key}>
                                    {[...new Set(hit._source[facet.key.split("__")[0]]
                                        .map((k: Record<string, any>) => k[facet.key.split("__")[1]] || '-'))]
                                        .join(', ')}
                                </td>
                            :
                                <td key={facet.key}>
                                    {getValueByKeyPath(facet.key, hit._source)}
                                </td>
                        ))}
                    </tr>
                    { searchParams.get('expanded') == hit._source.uuid && 
                        <tr>
                        <td colSpan={visibleColumns.length + 2} headers={"rowHeader_" + hit._id}>
                            <GroupedChildren snid={hit._source.snid} uuid={hit._source.uuid} childList={hit._source.children} setExpandLoading={setExpandLoading}/>
                        </td>
                        </tr>
                    }
                    </Fragment>
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
