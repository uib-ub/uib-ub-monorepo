
import { facetConfig } from "@/config/search-config"
import { contentSettings } from "@/config/server-config"
import { useDataset } from "@/lib/search-params"
import { useSearchParams } from "next/navigation"
import { useQueryState } from "nuqs"
import { Fragment, useContext, useState } from "react"
import { PiArrowCounterClockwise, PiCaretDown, PiCaretUp } from "react-icons/pi"
import { SearchContext } from "@/app/search-provider"
import Pagination from "@/components/results/pagination"
import { formatCadastre, resultRenderers } from "@/config/result-renderers"
import Link from "next/link"
import { getSkeletonLength } from "@/lib/utils"
import { infoPageRenderers } from "@/config/info-renderers"
import ClientThumbnail from "@/components/doc/client-thumbnail"
import DocInfo from "../info/doc-info"

export default function ListExplorer() {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const { tableData, totalHits, isLoading } = useContext(SearchContext)

    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)
    const localStorageKey = `visibleColumns_${dataset}`;

    const setAsc = useQueryState('asc')[1]
    const setDesc = useQueryState('desc')[1]

    const [visibleColumns, setVisibleColumns] = useState<string[]>(['adm', ...facetConfig[dataset].filter(item => item.table).map(facet => facet.key)])

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



    const handleCheckboxChange = (columnId: string, isChecked: boolean) => {
        if (isChecked) {
            setVisibleColumns(prev => [...prev, columnId]);
            localStorage.setItem(localStorageKey, JSON.stringify([...visibleColumns, columnId]));

        } else {
            setVisibleColumns(prev => prev.filter(id => id !== columnId));
            localStorage.setItem(localStorageKey, JSON.stringify(visibleColumns.filter(id => id !== columnId)));
        }
    }

    


    return <div  className='flex flex-col py-2 gap-y-4 h-full overflow-y-auto max-h-[calc(100vh-8rem)] '>
        

                    <ul className="flex flex-col divide-y divide-neutral-200 instance-info !pt-0">
                        {tableData?.map((item: any, index: number) => {
                            const docDataset = item._index.split('-')[2]
                            return <li key={index} className="p-2 flex">
                                
                                { item._source.image?.manifest && <ClientThumbnail manifestId={item._source.image?.manifest}/>}
                                <div className="flex flex-col px-4">
                                <DocInfo docParams={{docDataset, docData: item, snidParent: null, sameMarkerList: []}}/>
                                </div>
                                
                            </li>
                      
                        })}
                    </ul>
                    
                    
                    <nav className="center gap-2 mx-2 pb-4">

                    { totalHits && totalHits.value > 10 && <Pagination totalPages={Math.ceil(totalHits.value / (Number(searchParams.get('perPage')) || 10))}/>}
                    </nav>
                    
                    </div>

}
                    
                  
