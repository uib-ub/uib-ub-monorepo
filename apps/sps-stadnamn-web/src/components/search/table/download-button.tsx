'use client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { datasetTitles } from "@/config/metadata-config";
import { facetConfig } from "@/config/search-config";
import { contentSettings } from "@/config/server-config";
import { usePerspective } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";
import { useRouter } from "next/navigation";
import { PiDownload, PiX } from "react-icons/pi";


export function DownloadButton({ visibleColumns, showCadastre, joinWithSlash, formatCadastre }: { visibleColumns: string[], showCadastre: boolean, joinWithSlash: (adm: string | string[]) => string, formatCadastre: (cadastre: string) => string }) {
    const perspective = usePerspective()
    const { searchQueryString, datasetFilters } = useSearchQuery()
    const router = useRouter()

    const activeDatasetCode = datasetFilters.length === 1 ? datasetFilters[0][1] : null

    const fetchAllHits = async (fields: string[]) => {
        const pageSize = 10000
        const baseParams = new URLSearchParams(searchQueryString)
        baseParams.delete('size')
        baseParams.delete('from')

        let allHits: any[] = []
        let from = 0
        let firstResponse: any | null = null
        let total: { value?: number; relation?: string } | null = null

        // Paginate until we have all hits (or no more hits are returned)
        // Relies on hits.total.value when available to avoid extra requests.
        // Falls back to stopping when a page returns fewer than pageSize hits.
        // NOTE: This uses from/size pagination and is therefore limited by the
        // index's max_result_window setting in Elasticsearch.
        // If more results exist beyond that, they will not be included.
        // For very large exports, consider increasing max_result_window or
        // implementing search_after/scroll server-side.
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const pageParams = new URLSearchParams(baseParams)
            pageParams.set('size', pageSize.toString())
            pageParams.set('from', from.toString())
            pageParams.set('fields', fields.join(','))

            const response = await fetch(`/api/download?${pageParams.toString()}`)
            const data = await response.json()

            if (!firstResponse) {
                firstResponse = data
                total = data?.hits?.total || null
            }

            const pageHits: any[] = data?.hits?.hits || []
            if (!pageHits.length) {
                break
            }

            allHits = allHits.concat(pageHits)

            if (total?.value && allHits.length >= total.value) {
                break
            }

            if (pageHits.length < pageSize) {
                break
            }

            from += pageSize
        }

        return { allHits, firstResponse, total }
    }

    const handleJsonDownload = async () => {
        // Get all required fields based on visible columns
        const fields = ['label', 'uuid'];
        if (visibleColumns.includes('adm')) {
            fields.push('adm1', 'adm2', 'adm3');
        }
        if (showCadastre && visibleColumns.includes('cadastre')) {
            fields.push('cadastre');
        }
        // Add fields from facet config
        facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        const { allHits, firstResponse, total } = await fetchAllHits(fields)

        let exportData: any
        if (firstResponse && firstResponse.hits) {
            exportData = { ...firstResponse, hits: { ...firstResponse.hits, hits: allHits } }
            if (exportData.hits.total && typeof exportData.hits.total === 'object') {
                exportData.hits.total = {
                    value: allHits.length,
                    relation: total?.relation || 'eq',
                }
            }
        } else {
            exportData = { hits: { total: { value: allHits.length, relation: 'eq' }, hits: allHits } }
        }

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${perspective}_export.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeoJsonDownload = async () => {
        // Get all required fields based on visible columns
        const fields = ['label', 'location', 'uuid'];
        if (visibleColumns.includes('adm')) {
            fields.push('adm1', 'adm2', 'adm3');
        }
        if (showCadastre && visibleColumns.includes('cadastre')) {
            fields.push('cadastre');
        }
        // Add fields from facet config
        facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        const { allHits } = await fetchAllHits(fields)

        // Convert to GeoJSON format
        const geoJson = {
            type: "FeatureCollection",
            features: allHits
                .filter((hit: any) => hit.fields?.location?.[0])
                .map((hit: any) => {
                    const properties: any = {
                        label: hit.fields?.label?.[0] ?? '',
                        uuid: hit.fields?.uuid?.[0] ?? '',
                    };

                    // Add administrative area if visible
                    if (visibleColumns.includes('adm')) {
                        const adm1 = hit.fields.adm1?.[0] || '';
                        const adm2 = hit.fields.adm2?.[0] || '';
                        const adm3 = hit.fields.adm3?.[0] || '';
                        properties.område = `${joinWithSlash(adm2)}${adm3 ? ' - ' + joinWithSlash(adm3) : ''}${adm2 ? ', ' : ''}${joinWithSlash(adm1)}`;
                    }

                    // Add cadastre if visible
                    if (showCadastre && visibleColumns.includes('cadastre')) {
                        properties.matrikkel = hit.fields.cadastre ? formatCadastre(hit.fields.cadastre[0]) : '';
                    }

                    // Add facet fields if visible
                    facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
                        ?.forEach((facet: any) => {
                            if (facet.key.includes("__")) {
                                const [baseKey, subKey] = facet.key.split("__");
                                const values = hit.fields[baseKey]?.[0]?.map((k: Record<string, any>) => k[subKey] || '-') || [];
                                properties[facet.label] = [...new Set(values)].join(', ');
                            } else {
                                const value = hit.fields[facet.key]?.[0];
                                if (Array.isArray(value)) {
                                    properties[facet.label] = value.slice(0, 10).join(', ') + (value.length > 10 ? '...' : '');
                                } else {
                                    properties[facet.label] = value || '-';
                                }
                            }
                        });

                    return {
                        type: "Feature",
                        geometry: hit.fields.location[0],
                        properties
                    };
                })
        };
        const geoJsonContent = JSON.stringify(geoJson, null, 2);
        const blob = new Blob([geoJsonContent], { type: 'application/geo+json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${perspective}_export.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = async () => {
        // Get all required fields based on visible columns
        const fields = ['label', 'uuid'];
        if (visibleColumns.includes('adm')) {
            fields.push('adm1', 'adm2', 'adm3');
        }
        if (showCadastre && visibleColumns.includes('cadastre')) {
            fields.push('cadastre');
        }
        // Add fields from facet config
        facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        // Construct URL with fields parameter
        const { allHits } = await fetchAllHits(fields)

        // Prepare CSV headers based on visible columns
        const headers = ['Oppslagsord'];
        if (visibleColumns.includes('adm')) headers.push('Område');
        if (showCadastre && visibleColumns.includes('cadastre')) headers.push('Matrikkel');
        facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
            ?.forEach(facet => headers.push(facet?.label || ''));

        // Prepare CSV rows
        const rows = allHits.map((hit: any) => {
            const row = [hit.fields.label[0]];
            if (visibleColumns.includes('adm')) {
                const adm1 = hit.fields.adm1?.[0] || '';
                const adm2 = hit.fields.adm2?.[0] || '';
                const adm3 = hit.fields.adm3?.[0] || '';
                row.push(`${joinWithSlash(adm2)}${adm3 ? ' - ' + joinWithSlash(adm3) : ''}${adm2 ? ', ' : ''}${joinWithSlash(adm1)}`);
            }
            if (showCadastre && visibleColumns.includes('cadastre')) {
                row.push(hit.fields.cadastre ? formatCadastre(hit.fields.cadastre[0]) : '');
            }
            facetConfig[perspective]?.filter(item => item.key && item.key !== 'adm' && visibleColumns.includes(item.key))
                ?.forEach((facet: any) => {
                    if (facet.key.includes("__")) {
                        const [baseKey, subKey] = facet.key.split("__");
                        const values = hit.fields[baseKey]?.[0]?.map((k: Record<string, any>) => k[subKey] || '-') || [];
                        row.push([...new Set(values)].join(', '));
                    } else {
                        const value = hit.fields[facet.key]?.[0];
                        if (Array.isArray(value)) {
                            row.push(value.slice(0, 10).join(', ') + (value.length > 10 ? '...' : ''));
                        } else {
                            row.push(value || '-');
                        }
                    }
                });
            return row;
        });

        // Create CSV content with BOM and proper line endings
        const BOM = '\uFEFF';
        const csvContent = BOM + [
            headers.join(';'),
            ...rows.map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\r\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${perspective}_export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="btn btn-outline btn-compact pl-2 mt-2">
                    <PiDownload className="text-xl mr-2" aria-hidden="true" />
                    Last ned
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <PiX className="text-xl" aria-hidden="true" />
                    <span className="sr-only">Close</span>
                </AlertDialogCancel>
                <AlertDialogHeader>
                    <AlertDialogTitle>Last ned data</AlertDialogTitle>
                    <AlertDialogDescription>
                        Vel ønska format for nedlasting av data.
                        Du kan laste ned søket ditt som CSV, GeoJSON eller JSON.
                        {activeDatasetCode && " Du kan òg laste ned heile datasettet som JSONL."}
                        Merk at treff utan koordinater ikkje kjem med i GeoJSON-fila.

                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3 flex-1">
                        
                        <div className="flex flex-row flex-wrap gap-2 justify-start">
                            <AlertDialogAction
                                className="btn btn-outline"
                                onClick={handleDownload}
                            >
                                CSV
                            </AlertDialogAction>
                            <AlertDialogAction
                                className="btn btn-outline"
                                onClick={handleJsonDownload}
                            >
                                JSON
                            </AlertDialogAction>
                            {contentSettings[perspective]?.display === 'map' && (
                                <AlertDialogAction
                                    className="btn btn-outline"
                                    onClick={handleGeoJsonDownload}
                                >
                                    GeoJSON
                                </AlertDialogAction>
                            )}
                        </div>
                    </div>
                    {activeDatasetCode && (
                        <div className="flex flex-col gap-3 flex-1 sm:border-l sm:pl-6 sm:ml-4">
                            <p className="font-semibold text-sm text-left">Heile {datasetTitles[activeDatasetCode]}</p>
                            <div className="flex flex-row flex-wrap gap-2 justify-start">
                                <AlertDialogAction
                                    className="btn btn-outline"
                                    onClick={() => {
                                        if (!activeDatasetCode) return
                                        router.push(`https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/raw/iiif-and-new-aggregation/lfs-data/elastic/${activeDatasetCode}_elastic.jsonl?ref_type=heads&inline=false`)
                                    }}
                                >
                                    JSONL
                                </AlertDialogAction>
                            </div>
                        </div>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
