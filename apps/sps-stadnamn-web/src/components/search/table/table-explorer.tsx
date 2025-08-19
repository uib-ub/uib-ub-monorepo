import { facetConfig } from "@/config/search-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { usePerspective, useMode, useSearchQuery } from "@/lib/search-params"
import { useSearchParams } from "next/navigation"
import { Fragment, useContext, useEffect, useState } from "react"
import { PiBookOpen, PiMapPinFill } from "react-icons/pi"
import SortHeader from "./sort-header"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import { formatCadastre } from "@/config/result-renderers"
import { getSkeletonLength, stringToBase64Url } from "@/lib/utils"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import Clickable from "@/components/ui/clickable/clickable"
import { GlobalContext } from "@/app/global-provider"

export default function TableExplorer() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const { totalHits, isLoading } = useContext(SearchContext)
    const [ tableData, setTableData ] = useState<any[] | null>(null)
    const [ isLoadingResults, setIsLoadingResults ] = useState(false)
    const {searchQueryString } = useSearchQuery()
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const perPage = searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 10
    const desc = searchParams.get('desc')
    const asc = searchParams.get('asc')
    

    const doc = searchParams.get('doc')
    const group = searchParams.get('group')


    useEffect(() => {
        setIsLoadingResults(true)
        const url = `/api/search/table?size=${perPage}${searchQueryString ? `&${searchQueryString}`: ''}${desc ? `&desc=${desc}`: ''}${asc ? `&asc=${asc}` : ''}${page > 1 ? `&from=${(page-1)*perPage}`: ''}`
        fetch(url, {cache: 'force-cache', next: {tags: ['all']}})
          .then(response => {
            if (!response.ok) {
              setIsLoadingResults(false)
              throw response
            }
            return response.json()
          })
          .then(es_data => {
            setTableData(es_data.hits.hits)
          })
          .finally(() => setIsLoadingResults(false))
      }, [searchQueryString, page, perPage, desc, asc])




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
                    
                    
                    <div className="border border-neutral-300 rounded-md">
                     <table className='result-table'>
                        <thead>
                            {!isLoading ? <tr className={`${isLoadingResults ? 'opacity-50' : ''}`}>
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
                            
                        { !isLoading ? tableData?.map((hit: any) => (
                            <Fragment key={hit._id}>
                            <tr className={`${isLoadingResults ? 'opacity-50' : ''}`}>
                                {/* TODO: investigate whether rowgroup is still needed */}
                                <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit._source?.uuid ? 'rowgroup' : 'row'} className="!p-0">
                                    <div className="flex gap-1 items-center">
                                        <Clickable className="flex group items-center gap-2 p-2 no-underline"
                                            link
                                            aria-current={doc == hit._source?.uuid}
                                            add={{doc: hit._source?.uuid, 
                                                group: group ? stringToBase64Url(hit._source?.group?.id) : null,
                                                details: 'doc'
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
                    
                    <nav className="center gap-2 mx-2 pb-4">

                    { totalHits && totalHits.value > 10 && <Pagination/>}
                    </nav>
                    
                    </div>

}
                    
                  
