import { facetConfig } from "@/config/search-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { usePerspective } from "@/lib/param-hooks"
import { useSearchParams } from "next/navigation"
import { Fragment, useContext } from "react"
import { PiBookOpen, PiMapPinFill } from "react-icons/pi"
import SortHeader from "./sort-header"
import Pagination from "@/components/results/pagination"
import { formatCadastre } from "@/config/result-renderers"
import { getGnr, getSkeletonLength, getValueByPath } from "@/lib/utils"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import Clickable from "@/components/ui/clickable/clickable"
import { GlobalContext } from "@/app/global-provider"
import useSearchData from "@/state/hooks/search-data"
import useTableData from "@/state/hooks/table-data"
import { stringToBase64Url } from "@/lib/param-utils"
import { DownloadButton } from "./download-button"

export default function TableExplorer() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const { totalHits, searchLoading } = useSearchData()
   
    

    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')

    const { tableData, tableLoading } = useTableData()



    const { visibleColumns } = useContext(GlobalContext)
    const visibleColumnsArray = visibleColumns[perspective] || ['adm', ...facetConfig[perspective].filter(item => item.table).map(facet => facet.key)]

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

    


    return <div  className='flex flex-col py-2 gap-y-4 h-full'>
                    <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
                    { nav == 'tree' && doc && tableData?.[0]?._source && treeSettings[perspective] && <h2 className="text-xl px-1">{`${getGnr(tableData?.[0], perspective) || getValueByPath(tableData?.[0]?._source, treeSettings[perspective]?.subunit) || ""} ${getValueByPath(tableData?.[0]?._source, treeSettings[perspective]?.parentName) || tableData?.[0]?._source?.label || ""}`}</h2>}
                    
                    <div className="border border-neutral-300 rounded-md">
                    
                     <table className='result-table'>
                        <thead>
                            {!searchLoading ? <tr className={`${tableLoading ? 'opacity-50' : ''}`}>
                                <th>
                                    <SortHeader field="label.keyword" label="Oppslagsord" description='Oppslagsord'/>
                                </th>
                                
                                {
                                    visibleColumnsArray.includes('adm') && <th> 
                                        <SortHeader field={Array.from({length: contentSettings[perspective]?.adm || 0}, (_, i) => `adm${i+1}.keyword`).join(",")} label="Område"/>
                                    </th>
                                }
                                { showCadastre && visibleColumnsArray.includes('cadastre') &&
                                    <th>
                                    <SortHeader field='adm1.keyword,adm2.keyword,cadastre__gnr,cadastre__bnr' label="Matrikkel" description="Gnr/Bnr kommunevis"/>
                                    </th>
                                }
                                { facetConfig[perspective]?.filter(item => item.key && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
                                    <th key={facet.key}>
                                        <SortHeader field={facet.type ? facet.key : facet.key.replace("__", ".") + ".keyword"} label={facet.label} description={facet.description}/>
                                    </th>
                                )) }
                            </tr> 
                            : <tr>
                                <th colSpan={visibleColumnsArray.length + 1} className="!p-0">
                                    <div className="bg-neutral-200 h-12 animate-pulse" style={{width: '100%'}}></div>
                                </th>
                            </tr>
                            }
                        </thead>
                        <tbody>
                            
                        { !searchLoading ? tableData?.map((hit: any) => (
                            <Fragment key={hit._id}>
                            <tr className={`${tableLoading ? 'opacity-50' : ''}`}>
                                {/* TODO: investigate whether rowgroup is still needed */}
                                <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit._source?.uuid ? 'rowgroup' : 'row'} className="!p-0">
                                    <div className="flex gap-1 items-center">
                                        <Clickable className="flex group items-center gap-2 p-2 no-underline"
                                            link
                                            aria-current={doc == hit._source?.uuid}
                                            add={{doc: hit._source?.uuid, 
                                                details: 'group'
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
                                                mode: null,
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
                                    visibleColumnsArray.includes('adm') && <td>{joinWithSlash(hit._source.adm2)}{hit._source.adm3?.length && ' - ' + joinWithSlash(hit._source.adm3)}{joinWithSlash(hit._source.adm2) && ', '}{joinWithSlash(hit._source.adm1)}</td>
                                }
                                { showCadastre && visibleColumnsArray.includes('cadastre') &&
                                    <td>
                                        {hit._source.cadastre && formatCadastre(hit._source.cadastre)}
                                    </td>
                                }
                                { facetConfig[perspective]?.filter(item => item.key && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
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
                        )) : Array.from({length: totalHits?.value ? Math.min(totalHits.value, 10) : 10}, (_, index_a) => (
                            <tr key={index_a}>
                            {Array.from({ length: visibleColumnsArray.length + 1 }, (_, index_b) => (
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
                    
                    <div className="flex items-center gap-2 mx-2 pb-4 gap-4 justify-between">

                    { totalHits && totalHits.value > 10 && <Pagination/>}
                    <DownloadButton visibleColumns={visibleColumns[perspective] || []} showCadastre={showCadastre ?? false} joinWithSlash={joinWithSlash} formatCadastre={(cadastre: string) => formatCadastre([{cadastre}])}/>
                    </div>
                    
                    
                    </div>

}
                    
                  
