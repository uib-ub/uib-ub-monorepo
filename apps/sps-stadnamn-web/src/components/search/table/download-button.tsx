import { facetConfig } from "@/config/search-config";
import { usePerspective, useSearchQuery } from "@/lib/search-params";
import { useRouter } from "next/navigation";
import { PiDownload, PiX } from "react-icons/pi";
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
  } from "@/components/ui/alert-dialog"
import { contentSettings } from "@/config/server-config";





export function DownloadButton({visibleColumns, showCadastre, joinWithSlash, formatCadastre}: {visibleColumns: string[], showCadastre: boolean, joinWithSlash: (adm: string|string[]) => string, formatCadastre: (cadastre: string) => string}) {
    const perspective = usePerspective()
    const { searchQueryString } = useSearchQuery()
    const router = useRouter()

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
        facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        const url = `/api/download?${searchQueryString}&size=10000&fields=${fields.join(',')}`;
        const response = await fetch(url);
        const data = await response.json();
        const jsonContent = JSON.stringify(data, null, 2);
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
        facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        const url = `/api/download?${searchQueryString}&size=10000&fields=${fields.join(',')}`;
        const response = await fetch(url);
        const data = await response.json();

        // Convert to GeoJSON format
        const geoJson = {
            type: "FeatureCollection",
            features: data.hits.hits
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
                    facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
                        ?.forEach((facet: any) => {
                            if (facet.key.includes("__")) {
                                const [baseKey, subKey] = facet.key.split("__");
                                const values = hit.fields[baseKey]?.[0]?.map((k: Record<string, any>) => k[subKey] || '-') || [];
                                properties[facet.label] = [...new Set(values)].join(', ');
                            } else {
                                const value = hit.fields[facet.key]?.[0];
                                if (Array.isArray(value)) {
                                    properties[facet.label] = value.slice(0,10).join(', ') + (value.length > 10 ? '...' : '');
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
        facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
            ?.forEach(facet => {
                if (facet.key.includes("__")) {
                    fields.push(facet.key.split("__")[0]);
                } else {
                    fields.push(facet.key);
                }
            });

        // Construct URL with fields parameter
        const url = `/api/download?${searchQueryString}&size=10000&fields=${fields.join(',')}`;
        
        // Fetch the data
        const response = await fetch(url);
        const data = await response.json();
        
        // Prepare CSV headers based on visible columns
        const headers = ['Oppslagsord'];
        if (visibleColumns.includes('adm')) headers.push('Område');
        if (showCadastre && visibleColumns.includes('cadastre')) headers.push('Matrikkel');
        facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
            ?.forEach(facet => headers.push(facet?.label || ''));

        // Prepare CSV rows
        const rows = data.hits.hits.map((hit: any) => {
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
            facetConfig[perspective]?.filter(item => item.key && visibleColumns.includes(item.key))
                ?.forEach((facet: any) => {
                    if (facet.key.includes("__")) {
                        const [baseKey, subKey] = facet.key.split("__");
                        const values = hit.fields[baseKey]?.[0]?.map((k: Record<string, any>) => k[subKey] || '-') || [];
                        row.push([...new Set(values)].join(', '));
                    } else {
                        const value = hit.fields[facet.key]?.[0];
                        if (Array.isArray(value)) {
                            row.push(value.slice(0,10).join(', ') + (value.length > 10 ? '...' : ''));
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
                <button className="btn btn-outline btn-compact pl-2">
                    <PiDownload className="text-xl mr-2" aria-hidden="true"/>
                    Last ned
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <PiX className="text-xl" aria-hidden="true"/>
                    <span className="sr-only">Close</span>
                </AlertDialogCancel>
                <AlertDialogHeader>
                    <AlertDialogTitle>Last ned data</AlertDialogTitle>
                    <AlertDialogDescription>
                        Vel ønska format for nedlasting av data.
                        Du kan laste ned søket ditt som CSV, GeoJSON eller JSON, samt heile datasettet som JSON.
                        Mer at treff utan koordinatar ikkje kjem med i GeoJSON-fila.
                        
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row sm:flex-row gap-2 justify-center">
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
                    {contentSettings[perspective]?.display === 'map' && <AlertDialogAction 
                        className="btn btn-outline"
                        onClick={handleGeoJsonDownload}
                    >
                        GeoJSON
                    </AlertDialogAction>}
                    
                   
                    <AlertDialogAction 
                        className="btn btn-outline"
                        onClick={() => router.push(`https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/raw/main/lfs-data/elastic/${perspective}_elastic.json?ref_type=heads&inline=false`)}
                    >
                        JSON (heile datasettet)
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
