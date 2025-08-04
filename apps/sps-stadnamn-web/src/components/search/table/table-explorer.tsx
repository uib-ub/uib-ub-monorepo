import { facetConfig } from "@/config/search-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { usePerspective, useMode } from "@/lib/search-params"
import { useSearchParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { Fragment, useContext, useState } from "react"
import { PiArrowCounterClockwise, PiBookOpen, PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold, PiMapPinFill } from "react-icons/pi"
import SortHeader from "./sort-header"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import { formatCadastre } from "@/config/result-renderers"
import { getSkeletonLength } from "@/lib/utils"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { GlobalContext } from "@/app/global-provider"
import { DownloadButton } from "./download-button"
import Clickable from "@/components/ui/clickable/clickable"

export default function TableExplorer() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const { tableData, totalHits, isLoading } = useContext(SearchContext)

    const setAsc = useQueryState('asc')[1]
    const setDesc = useQueryState('desc')[1]
    const doc = searchParams.get('doc')

    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const localStorageKey = `visibleColumns_${perspective}`;

    const mode = useMode()
    const { isMobile } = useContext(GlobalContext)

    const [visibleColumns, setVisibleColumns] = useState<string[]>(['adm', ...facetConfig[perspective].filter(item => item.table).map(facet => facet.key)])

    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[perspective]?.cadastre

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
        const facetColumns = (facetConfig[perspective]?.filter(item => item.table).map(facet => facet.key) || []).filter((key): key is string => key !== undefined);
        if (contentSettings[perspective]?.adm) {
          facetColumns.unshift('adm')
        }
        if (contentSettings[perspective]?.cadastre) {
          facetColumns.push('cadastre')
        }
        setVisibleColumns(facetColumns)
        localStorage.removeItem(localStorageKey);
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


    return <div  className='flex flex-col py-2 gap-y-4 h-full'>
                    <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
                    <div className='flex gap-2 mt-2 xl:mt-0'>
                    <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => setColumnSelectorOpen(!columnSelectorOpen)} aria-expanded={columnSelectorOpen} aria-controls={columnSelectorOpen ? 'column-selector' : undefined}>
                        { columnSelectorOpen ? <PiCaretUpBold className='text-xl mr-2' aria-hidden="true"/> : <PiCaretDownBold className='text-xl mr-2' aria-hidden="true"/> }           
                        Kolonner
                    </button>
                    { // Reset button if visible columns is different from default
                    visibleColumns.length !== (facetConfig[perspective]?.filter(item => item.table).length
                                                        + (contentSettings[perspective]?.adm ? 1 : 0 )
                                                        + (contentSettings[perspective]?.cadastre ? 1 : 0 )
                                                        || 0) &&
                    <button type="button" className='btn btn-outline btn-compact pl-2' onClick={resetColumns}>
                        <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true"/>
                        Tilbakestill kolonner
                    </button>
        
                    }
                    <DownloadButton visibleColumns={visibleColumns} showCadastre={showCadastre ?? false} joinWithSlash={joinWithSlash} formatCadastre={(cadastre: string) => formatCadastre([{cadastre}])}/>
                    { (searchParams.get('asc') || searchParams.get('desc')) &&
                        <button type="button" className='btn btn-outline btn-compact pl-2' onClick={() => {setAsc(null); setDesc(null)}}>
                        <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true"/>
                        Tilbakestill sortering
                    </button>
                    }
                    </div>
                    
                    { columnSelectorOpen && <div className='flex gap-4 px-2 flex-wrap' id="column-selector">
                        { contentSettings[perspective]?.adm && <div>
                            <label className="flex gap-2">
                                <input
                                type="checkbox"
                                checked={visibleColumns.includes('adm')}
                                onChange={(e) => handleCheckboxChange('adm', e.target.checked)}
                                />
                                Område
                            </label>
                        </div>}
                        { contentSettings[perspective]?.cadastre && <div>
                            <label className="flex gap-2">
                                <input
                                type="checkbox"
                                checked={visibleColumns.includes('cadastre')}
                                onChange={(e) => handleCheckboxChange('cadastre', e.target.checked)}
                                />
                                Matrikkel
                            </label>
                        </div>}
                        {facetConfig[perspective]?.map((facet: any) => (
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
                    <div className="border border-neutral-300 rounded-md">
                     <table className='result-table'>
                        <thead>
                            <tr>
                                <th>
                                    <SortHeader field="label.keyword" label="Oppslagsord" description='Oppslagsord'/>
                                </th>
                                
                                {
                                    visibleColumns.includes('adm') && <th> 
                                        <SortHeader field={Array.from({length: contentSettings[perspective]?.adm || 0}, (_, i) => `adm${i+1}.keyword`).join(",")} label="Område"/>
                                    </th>
                                }
                                { showCadastre && visibleColumns.includes('cadastre') &&
                                    <th>
                                    <SortHeader field='adm1.keyword,adm2.keyword,cadastre__gnr,cadastre__bnr' label="Matrikkel" description="Gnr/Bnr kommunevis"/>
                                    </th>
                                }
                                { facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))?.map((facet: any) => (
                                    <th key={facet.key}>
                                        <SortHeader field={facet.type ? facet.key : facet.key.replace("__", ".") + ".keyword"} label={facet.label} description={facet.description}/>
                                    </th>
                                )) }
                            </tr>
                        </thead>
                        <tbody>
                            
                        { !isLoading ? tableData?.map((hit: any) => (
                            <Fragment key={hit._id}>
                            <tr>
                                {/* TODO: investigate whether rowgroup is still needed */}
                                <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit._source?.uuid ? 'rowgroup' : 'row'} className="!p-0">
                                    <div className="flex gap-1 items-center">
                                        <Clickable className="flex group items-center gap-2 p-2 no-underline"
                                            link
                                            remove={['nav']}
                                            aria-current={doc == hit._source?.uuid}
                                            add={{doc: hit._source?.uuid, 
                                                ...(hit._source.children?.length || (treeSettings[perspective] && hit._source.sosi == 'gard')) && !isMobile ? {parent: hit._source?.uuid} : {}
                                            }}
                                        >
                                            <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current=true]:border-accent-800 border-2 border-transparent">
                                                <PiBookOpen aria-hidden="true" className="text-primary-600 group-aria-[current=true]:text-accent-800" />
                                            </div>
                                            {hit._source?.label}
                                        </Clickable>
                                        {hit._source?.location?.coordinates && <ClickableIcon
                                            className="p-1 hover:bg-neutral-100 rounded-full"
                                            link
                                            add={{
                                                doc: hit._source?.uuid,
                                                mode: 'map',
                                                center: hit._source.location.coordinates,
                                                zoom: "8"
                                            }}
                                            label="Vis på kart"
                                        >
                                            <PiMapPinFill aria-hidden="true" className="text-neutral-700" />
                                        </ClickableIcon>}
                                    </div>
                                </th>
                                {
                                    visibleColumns.includes('adm') && <td>{joinWithSlash(hit._source.adm2)}{hit._source.adm3?.length && ' - ' + joinWithSlash(hit._source.adm3)}{joinWithSlash(hit._source.adm2) && ', '}{joinWithSlash(hit._source.adm1)}</td>
                                }
                                { showCadastre && visibleColumns.includes('cadastre') &&
                                    <td>
                                        {hit._source.cadastre && formatCadastre(hit._source.cadastre)}
                                    </td>
                                }
                                { facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))?.map((facet: any) => (
                                    facet.key.includes("__") ? 
                                        <td key={facet.key}>
                                            {[...new Set(hit._source[facet.key.split("__")[0]]
                                                ?.map((k: Record<string, any>) => k[facet.key.split("__")[1]] || '-'))]
                                                .join(', ')}
                                        </td>
                                    :
                                        <td key={facet.key}>
                                            {getValueByKeyPath(facet.key, hit._source)}
                                        </td>
                                ))}
                            </tr>

                            </Fragment>
                        )) : Array.from({length: 10}, (_, index_a) => (
                            <tr key={index_a}>
                            {Array.from({ length: visibleColumns.length + 1 }, (_, index_b) => (
                                <td key={index_b} className="!h-12">
                                    <div className="bg-neutral-200 rounded-full h-4 animate-pulse my-1" style={{width: `${getSkeletonLength(index_a + index_b, 4, 10)}rem`}}></div>
                                </td>
                            ))}
                        
                        </tr>
                        ))}
                        


        
                    
        
        
                        </tbody>
                    </table>
                    </div>
                    </div>
                    
                    <nav className="center gap-2 mx-2 pb-4">

                    { totalHits && totalHits.value > 10 && <Pagination totalPages={Math.ceil(totalHits.value / (Number(searchParams.get('perPage')) || 10))}/>}
                    </nav>
                    
                    </div>

}
                    
                  
