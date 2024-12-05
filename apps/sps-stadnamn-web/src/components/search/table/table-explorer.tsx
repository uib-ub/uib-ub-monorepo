import CadastralSubdivisions from "@/components/doc/cadastral-subdivisions"
import { facetConfig } from "@/config/search-config"
import { contentSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/router"
import { useQueryState } from "nuqs"
import { Fragment, useContext, useState } from "react"
import { PiArrowCounterClockwise, PiCaretDown, PiCaretUp } from "react-icons/pi"
import SortButton from "./sort-button"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import { formatCadastre } from "@/config/result-renderers"

export default function TableExplorer() {
    const cadastralUnit = useQueryState('cadastralUnit')[0]
    const nav = useQueryState('nav')[0]
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const { resultData, totalHits } = useContext(SearchContext)

    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState<string[]>([])
    const localStorageKey = `visibleColumns_${dataset}`;
    const [expandLoading, setExpandLoading] = useState<boolean>(false)

    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[dataset]?.cadastre

    const joinWithSlash = (adm: string|string[]) => Array.isArray(adm) ? adm.join('/') : adm;

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

    const resetColumns = () => {
        const facetColumns = (facetConfig[dataset]?.filter(item => item.table).map(facet => facet.key) || []).filter((key): key is string => key !== undefined);
        if (contentSettings[dataset]?.adm) {
          facetColumns.unshift('adm')
        }
        if (contentSettings[dataset]?.cadastre) {
          facetColumns.push('cadastre')
        }
        setVisibleColumns(facetColumns)
        localStorage.removeItem(localStorageKey);
      }

      const resetSort = () => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('asc')
        newSearchParams.delete('desc')
        //router.push(`/view/${dataset}?${newSearchParams.toString
        }

    const handleCheckboxChange = (columnId: string, isChecked: boolean) => {
        if (isChecked) {
            setVisibleColumns(prev => [...prev, columnId]);
            localStorage.setItem(localStorageKey, JSON.stringify([...visibleColumns, columnId]));

        } else {
            setVisibleColumns(prev => prev.filter(id => id !== columnId));
            localStorage.setItem(localStorageKey, JSON.stringify(visibleColumns.filter(id => id !== columnId)));
        }
        }
    


    return <>
       
        { nav == 'tree' && cadastralUnit ?
                <CadastralSubdivisions isMobile={false}/>
            
                :

                
                <div  className='flex flex-col py-2 gap-y-4 h-full overflow-y-auto'>
                    <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
                    <div className='flex gap-2 mt-2 xl:mt-0'>
                    <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => setColumnSelectorOpen(!columnSelectorOpen)} aria-expanded={columnSelectorOpen} aria-controls={columnSelectorOpen ? 'column-selector' : undefined}>
                        { columnSelectorOpen ? <PiCaretUp className='text-xl mr-2' aria-hidden="true"/> : <PiCaretDown className='text-xl mr-2' aria-hidden="true"/> }           
                        Kolonner
                    </button>
                    { // Reset button if visible columns is different from default
                    visibleColumns.length !== (facetConfig[dataset]?.filter(item => item.table).length
                                                        + (contentSettings[dataset]?.adm ? 1 : 0 )
                                                        + (contentSettings[dataset]?.cadastre ? 1 : 0 )
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
                        { contentSettings[dataset]?.adm && <div>
                            <label className="flex gap-2">
                                <input
                                type="checkbox"
                                checked={visibleColumns.includes('adm')}
                                onChange={(e) => handleCheckboxChange('adm', e.target.checked)}
                                />
                                Område
                            </label>
                        </div>}
                        { contentSettings[dataset]?.cadastre && <div>
                            <label className="flex gap-2">
                                <input
                                type="checkbox"
                                checked={visibleColumns.includes('cadastre')}
                                onChange={(e) => handleCheckboxChange('cadastre', e.target.checked)}
                                />
                                Matrikkel
                            </label>
                        </div>}
                        {facetConfig[dataset]?.map((facet: any) => (
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
                                        <SortButton field={Array.from({length: contentSettings[dataset]?.adm || 0}, (_, i) => `adm${i+1}.keyword`).join(",")} label="Område"/>
                                    </th>
                                }
                                { showCadastre && visibleColumns.includes('cadastre') &&
                                    <th>
                                    <SortButton field='adm1.keyword,adm2.keyword,cadastre__gnr,cadastre__bnr' label="Matrikkel" description="Gnr/Bnr kommunevis"/>
                                    </th>
                                }
                                { facetConfig[dataset]?.filter(item => item.key && visibleColumns.includes(item.key)).map((facet: any) => (
                                    <th key={facet.key}>
                                        <SortButton field={facet.type ? facet.key : facet.key + ".keyword"} label={facet.label} description={facet.description}/>
                                    </th>
                                )) }
                            </tr>
                        </thead>
                        <tbody>
                        { resultData?.map((hit: any) => (
                            <Fragment key={hit._id}>
                            <tr>
                                <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit.fields.uuid ? 'rowgroup' : 'row'}>
                                {JSON.stringify(hit.fields?.label)}
                                </th>
                                {
                                    visibleColumns.includes('adm') && <td>{joinWithSlash(hit.fields.adm2)}{hit.fields.adm3?.length && ' - ' + joinWithSlash(hit.fields.adm3)}{joinWithSlash(hit.fields.adm2) && ', '}{joinWithSlash(hit.fields.adm1)}</td>
                                }
                                { showCadastre && visibleColumns.includes('cadastre') &&
                                    <td>
                                        {hit.fields.cadastre && formatCadastre(hit.fields.cadastre)}
                                    </td>
                                }
                                { facetConfig[dataset]?.filter(item => item.key && visibleColumns.includes(item.key)).map((facet: any) => (
                                    facet.key.includes("__") ? 
                                        <td key={facet.key}>
                                            {[...new Set(hit.fields[facet.key.split("__")[0]]
                                                .map((k: Record<string, any>) => k[facet.key.split("__")[1]] || '-'))]
                                                .join(', ')}
                                        </td>
                                    :
                                        <td key={facet.key}>
                                            {getValueByKeyPath(facet.key, hit.fields)}
                                        </td>
                                ))}
                            </tr>

                            </Fragment>
                        ))
                    }
        
                    
        
        
                        </tbody>
                    </table>
                    
                    </div>
                    <nav className="center gap-2 mx-2 pb-4">

                    { totalHits && totalHits.value > 10 && <Pagination totalPages={Math.ceil(totalHits.value / (Number(searchParams.get('size')) || 10))}/>}
                    </nav>
                    
                    </div>
}
    </>
}
                    
                  
