'use client'
import Pagination from "./pagination"
import { TitleBadge } from "@/components/ui/badge"
import Clickable from "@/components/ui/clickable/clickable"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { datasetTitles } from "@/config/metadata-config"
import { formatCadastre } from "@/config/result-renderers"
import { facetConfig } from "@/config/search-config"
import { contentSettings, treeSettings } from "@/config/server-config"
import { useDocParam, useOptionsOn, usePerspective, useTreeParam } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import { getGnr, getSkeletonLength, getValueByPath, indexToCode } from "@/lib/utils"
import useSearchData from "@/state/hooks/search-data"
import useTableData from "@/state/hooks/table-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useSearchParams } from "next/navigation"
import { Fragment, useContext } from "react"
import { PiFunnel, PiFunnelFill, PiMapPinFill, PiMapTrifold } from "react-icons/pi"
import StatusSection from "@/components/table/status-section"
import { DownloadButton } from "./download-button"
import SortHeader from "./sort-header"
import SearchQueryDisplay from "../results/search-query-display"

export default function TableExplorer() {
    const perspective = usePerspective()
    const { docTotalHits, searchLoading } = useSearchData()
    const doc = useDocParam()
    const tree = useTreeParam()
    const { tableData, tableLoading } = useTableData()
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const { visibleColumns } = useContext(GlobalContext)
    const visibleColumnsArray = visibleColumns[perspective] || ['adm', ...facetConfig[perspective].filter(item => item.table).map(facet => facet.key)]
    const optionsOn = useOptionsOn()

    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[perspective]?.cadastre

    const joinWithSlash = (adm: string | string[]) => Array.isArray(adm) ? adm.join('/') : adm;

    const formatArea = (source: Record<string, any>) => {
        const adm2 = joinWithSlash(source?.adm2) || '';
        const adm3 = source?.adm3?.length ? ` - ${joinWithSlash(source.adm3)}` : '';
        const adm1 = joinWithSlash(source?.adm1) || '';
        const comma = adm2 ? ', ' : '';
        const area = `${adm2}${adm3}${comma}${adm1}`.trim();

        return area || '-';
    };

    const getDatasetTitle = (index?: string) => {
        if (!index) return '-';
        const dataset = indexToCode(index)?.[0];
        return (dataset && datasetTitles[dataset]) || dataset || '-';
    };

    function getValueByKeyPath(key: string, source: Record<string, any>, index?: string): any {
        if (key === 'dataset') {
            return getDatasetTitle(index);
        }

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




    return <section aria-labelledby="table-explorer-title"><div className="flex items-baseline gap-2 px-4 p-2"><div id="table-explorer-title" className="text-xl !m-0 !p-0">Tabellvisning</div>
        {!searchLoading && docTotalHits &&
            <div
                className="text-neutral-700 ml-4"
                role="status"
                aria-live="polite"
            >
                {docTotalHits.value.toLocaleString('no-NO')} treff{docTotalHits.relation != 'eq' ? '+' : ''}
            </div>
        }
        <div className="flex items-center flex-wrap gap-2 ml-auto">
        <SearchQueryDisplay/>


        <Clickable className="flex items-center gap-2 btn btn-outline h-9" add={{ options: 'on' }}>{optionsOn ? <PiFunnelFill className="text-lg text-accent-700" aria-hidden="true" /> : <PiFunnel className="text-lg" aria-hidden="true" />}<span className="sr-only lg:not-sr-only">Filter</span>{filterCount > 0 && <TitleBadge className="bg-neutral-700 text-white text-sm" count={filterCount} />}</Clickable>
        <Clickable className="flex items-center gap-2 btn btn-neutral h-9" add={{sourceView: 'on'}} remove={['mode', 'tableOptions']}><PiMapTrifold className="text-lg" aria-hidden="true" /><span className="sr-only lg:not-sr-only">Kartvisning</span></Clickable></div>
        </div>
        <div className='flex flex-col py-2 gap-y-4 h-full bg-white'>
            <div className='flex  flex-col gap-4 xl:gap-2 !mx-2'>
                {tree && doc && tableData?.[0]?._source && treeSettings[perspective] && <div className="text-xl px-1">{`${getGnr(tableData?.[0])} ${tableData?.[0]?._source.parentLabel || tableData?.[0]?._source?.label}`}</div>}

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
                                            <SortHeader field='cadastralIndex' label="Matrikkel" description="Sortert etter matrikkelhierarki" />
                                        </th>
                                    }
                                    {facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
                                        <th key={facet.key}>
                                            <SortHeader field={(facet.type || facet.keyword) ? facet.key.replace("__", ".") : facet.key.replace("__", ".") + ".keyword"} label={facet.label} description={facet.description} />
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
                                            <th id={"rowHeader_" + hit._id} scope={'row'} className="!p-0">
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
                                                            init: hit._source?.group?.id,
                                                            activePoint: [hit._source.location.coordinates[1], hit._source.location.coordinates[0]].join(','),
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
                                                visibleColumnsArray.includes('adm') && <td>{formatArea(hit._source)}</td>                                            }
                                            {showCadastre && visibleColumnsArray.includes('cadastre') &&
                                                <td>
                                                    {hit._source.cadastre && formatCadastre(hit._source.cadastre)}
                                                </td>
                                            }
                                            {facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumnsArray.includes(item.key))?.map((facet: any) => (
                                                facet.key.includes("__") ?
                                                    <td key={facet.key}>
                                                        {[...new Set(hit._source[facet.key.split("__")[0]]
                                                            ?.map((k: Record<string, any>) => k[facet.key.split("__")[1]] || '-'))]
                                                            .join(', ')}
                                                    </td>
                                                    :
                                                    <td key={facet.key} title={facet.key === 'dataset' ? getDatasetTitle(hit._index) : undefined}>
                                                        {facet.key === 'dataset'
                                                            ? <span className="block truncate max-w-80">{getValueByKeyPath(facet.key, hit._source, hit._index)}</span>
                                                            : getValueByKeyPath(facet.key, hit._source, hit._index)}
                                                    </td>
                                            ))}
                                        </tr>

                                    </Fragment>
                                )) : Array.from({ length: docTotalHits?.value ? Math.min(docTotalHits.value, 10) : 10 }, (_, index_a) => (
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
                {docTotalHits && docTotalHits.value > 10 && (
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
    </section>

}


