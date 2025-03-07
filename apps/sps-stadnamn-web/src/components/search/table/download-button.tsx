import { facetConfig } from "@/config/search-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { useRouter, useSearchParams } from "next/navigation";
import { PiDownload } from "react-icons/pi";
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
import Link from "next/link";





export function DownloadButton({visibleColumns, showCadastre, joinWithSlash, formatCadastre}: {visibleColumns: string[], showCadastre: boolean, joinWithSlash: (adm: string|string[]) => string, formatCadastre: (cadastre: string) => string}) {
    const dataset = useDataset()
    const { searchQueryString } = useSearchQuery()
    const router = useRouter()
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
        facetConfig[dataset]?.filter(item => item.key && visibleColumns.includes(item.key))
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
        facetConfig[dataset]?.filter(item => item.key && visibleColumns.includes(item.key))
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
            facetConfig[dataset]?.filter(item => item.key && visibleColumns.includes(item.key))
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
        link.download = `${dataset}_export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return <AlertDialog>
    <AlertDialogTrigger asChild><button 
        className="btn btn-outline btn-compact pl-2" 
    >
        <PiDownload className="text-xl mr-2" aria-hidden="true"/>
        Last ned
    </button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Last ned data</AlertDialogTitle>
        <AlertDialogDescription className="space-y-4">
          Nedlasting av csv med kolonnene du har valgt er begrenset til 10 000 rader. Alternativt kan du laste ned det fullstendige datasettet som JSON.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="btn btn-outline">Avbryt</AlertDialogCancel>
        <AlertDialogAction className="btn btn-outline" onClick={() => router.push(`https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/raw/main/lfs-data/elastic/${dataset}_elastic.json?ref_type=heads&inline=false`)}>Last ned json</AlertDialogAction>
        <AlertDialogAction className="btn btn-outline" onClick={handleDownload}>Last ned csv </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}
