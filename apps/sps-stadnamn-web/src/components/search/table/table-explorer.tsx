'use client'
import Pagination from "@/components/results/pagination"
import { TitleBadge } from "@/components/ui/badge"
import Clickable from "@/components/ui/clickable/clickable"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { formatCadastre } from "@/config/result-renderers"
import { facetConfig } from "@/config/search-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { usePerspective } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import { getGnr, getSkeletonLength, getValueByPath } from "@/lib/utils"
import useSearchData from "@/state/hooks/search-data"
import useTableData from "@/state/hooks/table-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useSearchParams } from "next/navigation"
import { Fragment, useContext } from "react"
import { PiFunnel, PiMapPinFill, PiMapTrifold } from "react-icons/pi"
import StatusSection from "../status-section"
import { DownloadButton } from "./download-button"
import SortHeader from "./sort-header"

export default function TableExplorer() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const { totalHits, searchLoading } = useSearchData()



    const doc = searchParams.get('doc')
    const datasetTag = searchParams.get('datasetTag')

    const { tableData, tableLoading } = useTableData()
    const currentPosition = useSessionStore((s) => s.currentPosition)

    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length



    const { visibleColumns } = useContext(GlobalContext)
    const visibleColumnsArray = visibleColumns[perspective] || ['adm', ...facetConfig[perspective].filter(item => item.table).map(facet => facet.key)]

    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[perspective]?.cadastre

    const joinWithSlash = (adm: string | string[]) => Array.isArray(adm) ? adm.join('/') : adm;

    function getValueByKeyPath(key: string, source: Record<string, any>): any {
        let value = key.split('.').reduce((o: Record<string, any> | undefined, k: string) => (o || {})[k], source);

        if (value && key == 'datasets') {
            value = value.map((dataset: string) => dataset.toUpperCase())
        }


        if (Array.isArray(value)) {
            // Limit to 10 values
            return value.slice(0, 10).join(', ') + (value.length > 10 ? '...' : '');
        }
        return value || '-';
    }




    return <><div className="flex items-baseline gap-2 px-4 p-2"><h2 className="text-xl !m-0 !p-0">Kjeldetabell</h2>


        <Clickable className="flex items-center gap-2 btn btn-outline ml-auto" add={{ options: 'on' }}><PiFunnel className="text-lg" aria-hidden="true" /><span className="sr-only lg:not-sr-only">Filter</span>{filterCount > 0 && <TitleBadge className="bg-accent-100 text-accent-900 text-sm xl:text-base" count={filterCount} />}</Clickable>
        <Clickable className="flex items-center gap-2 btn btn-neutral" remove={['mode', 'tableOptions']}><PiMapTrifold className="text-lg" aria-hidden="true" /><span className="sr-only lg:not-sr-only">Kartvisning</span></Clickable></div>
        <div className='flex flex-col py-2 gap-y-4 h-full bg-white'>
            <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
                {datasetTag == 'tree' && doc && tableData?.[0]?._source && treeSettings[perspective] && <h2 className="text-xl px-1">{`${getGnr(tableData?.[0], perspective) || getValueByPath(tableData?.[0]?._source, treeSettings[perspective]?.subunit) || ""} ${getValueByPath(tableData?.[0]?._source, treeSettings[perspective]?.parentName) || tableData?.[0]?._source?.label || ""}`}</h2>}

                {tableData && tableData.length > 0 ?
                    <div className="border border-neutral-300 rounded-md">

                        <table className='result-table'>
                            <thead>
                                {!searchLoading ? <tr className={`${tableLoading ? 'opacity-50' : ''}`}>
                                    <th>
                                        <SortHeader field="label.keyword" label="Oppslagsord" description='Oppslagsord' />
                                    </th>

                                    {
                                        visibleColumnsArray.includes('adm') && <th>
                                            <SortHeader field={Array.from({ length: contentSettings[perspective]?.adm || 0 }, (_, i) => `adm${i + 1}.keyword`).join(",")} label="Område" />
                                        </th>
                                    }
                                    {showCadastre && visibleColumnsArray.includes('cadastre') &&
                                        <th>
                                            <SortHeader field='adm1.keyword,adm2.keyword,cadastre__gnr,cadastre__bnr' label="Matrikkel" description="Gnr/Bnr kommunevis" />
                                        </th>
                                    }
                                    {facetConfig[perspective]?.filter(item => item.key && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
                                        <th key={facet.key}>
                                            <SortHeader field={facet.type ? facet.key : facet.key.replace("__", ".") + ".keyword"} label={facet.label} description={facet.description} />
                                        </th>
                                    ))}
                                </tr>
                                    : <tr>
                                        <th colSpan={visibleColumnsArray.length + 1} className="!p-0">
                                            <div className="bg-neutral-200 h-12 animate-pulse" style={{ width: '100%' }}></div>
                                        </th>
                                    </tr>
                                }
                            </thead>
                            <tbody>

                                {!searchLoading ? tableData?.map((hit: any) => (
                                    <Fragment key={hit._id}>
                                        <tr className={`${tableLoading ? 'opacity-50' : ''}`}>
                                            {/* TODO: investigate whether rowgroup is still needed */}
                                            <th id={"rowHeader_" + hit._id} scope={searchParams.get('expanded') == hit._source?.uuid ? 'rowgroup' : 'row'} className="!p-0">
                                                <div className="flex gap-1 items-center">
                                                    <Clickable className="flex group items-center gap-2 p-2 no-underline"
                                                        link
                                                        href={`/uuid/${hit._source?.uuid}`}
                                                    >
                                                        {hit._source?.label}
                                                    </Clickable>
                                                    {hit._source?.location?.coordinates && <ClickableIcon
                                                        className="p-1 hover:bg-neutral-100 rounded-full"
                                                        link
                                                        add={{
                                                            doc: hit._source?.uuid,
                                                            mode: null,
                                                            center: [hit._source.location.coordinates[1], hit._source.location.coordinates[0]].join(','),
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
                                            {showCadastre && visibleColumnsArray.includes('cadastre') &&
                                                <td>
                                                    {hit._source.cadastre && formatCadastre(hit._source.cadastre)}
                                                </td>
                                            }
                                            {facetConfig[perspective]?.filter(item => item.key && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
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
                                )) : Array.from({ length: totalHits?.value ? Math.min(totalHits.value, 10) : 10 }, (_, index_a) => (
                                    <tr key={index_a}>
                                        {Array.from({ length: visibleColumnsArray.length + 1 }, (_, index_b) => (
                                            <td key={index_b} className="!h-12">
                                                <div className="bg-neutral-200 rounded-full h-4 animate-pulse my-1" style={{ width: `${getSkeletonLength(index_a + index_b, 4, 10)}rem` }}></div>
                                            </td>
                                        ))}

                                    </tr>
                                ))}







                            </tbody>
                        </table>

                    </div>
                    : <StatusSection />
                }
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mx-2 pb-4 sm:justify-between">
                {totalHits && totalHits.value > 10 && (
                    <div className="order-2 sm:order-1">
                        <Pagination />
                    </div>
                )}
                <div className="order-1 sm:order-2 w-full sm:w-auto">
                    <DownloadButton
                        visibleColumns={visibleColumns[perspective] || []}
                        showCadastre={showCadastre ?? false}
                        joinWithSlash={joinWithSlash}
                        formatCadastre={(cadastre: string) => formatCadastre([{ cadastre }])}
                    />
                </div>
            </div>


        </div>
    </>

}


