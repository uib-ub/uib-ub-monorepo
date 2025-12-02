import Clickable from "@/components/ui/clickable/clickable";
import { facetConfig } from "@/config/search-config";
import { contentSettings } from "@/config/server-config";
import { usePerspective } from '@/lib/param-hooks';
import { GlobalContext } from "@/state/providers/global-provider";
import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import { PiArrowCounterClockwise, PiFunnel } from "react-icons/pi";



export default function TableOptions() {
    const perspective = usePerspective()
    const localStorageKey = `visibleColumns_${perspective}`;
    const searchParams = useSearchParams()

    const { isMobile, visibleColumns, setVisibleColumns } = useContext(GlobalContext)
    const [columnFilter, setColumnFilter] = useState('')



    // Hide adm if only one value is present and it has no sublevels
    const showCadastre = contentSettings[perspective]?.cadastre



    const resetColumns = () => {
        const facetColumns = (facetConfig[perspective]?.filter(item => item.table).map(facet => facet.key) || []).filter((key): key is string => key !== undefined);
        if (contentSettings[perspective]?.adm) {
            facetColumns.unshift('adm')
        }
        if (contentSettings[perspective]?.cadastre) {
            facetColumns.push('cadastre')
        }
        setVisibleColumns(perspective, facetColumns)
        localStorage.removeItem(localStorageKey);
    }



    const handleCheckboxChange = (columnId: string, isChecked: boolean) => {
        if (isChecked) {
            setVisibleColumns(perspective, [...visibleColumns[perspective], columnId]);

        } else {
            setVisibleColumns(perspective, visibleColumns[perspective].filter(id => id !== columnId));
        }
    }



    return <div className="flex flex-col gap-2 px-1">
        <div className='flex gap-2 mt-2 xl:mt-0'>


            {(searchParams.get('asc') || searchParams.get('desc')) &&
                <Clickable type="button" className='btn btn-outline btn-compact pl-2' add={{ asc: null, desc: null }}>
                    <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true" />
                    Tilbakestill sortering
                </Clickable>
            }
        </div>

        <div className="flex items-center gap-2">
            <h3 className="text-lg">Kolonner</h3>
        </div>
        <div className='relative'>
            <input
                type="text"
                className="pl-8 w-full border rounded-md border-neutral-300 p-1"
                aria-label="Søk etter kolonne"
                value={columnFilter}
                onChange={(e) => setColumnFilter(e.target.value)}
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <PiFunnel aria-hidden={true} className='text-neutral-500 text-xl' />
            </span>
        </div>
        { // Reset button if visible columns is different from default
            visibleColumns[perspective]?.length !== (facetConfig[perspective]?.filter(item => item.table).length
                + (contentSettings[perspective]?.adm ? 1 : 0)
                + (contentSettings[perspective]?.cadastre ? 1 : 0)
                || 0) &&
            <button type="button" className='btn btn-outline btn-compact pl-2' onClick={resetColumns}>
                <PiArrowCounterClockwise className='text-xl mr-2' aria-hidden="true" />
                Tilbakestill kolonner
            </button>

        }

        <div className='flex gap-4 px-2 flex-col'>
            {contentSettings[perspective]?.cadastre && <div>
                <label className="flex gap-2">
                    <input
                        type="checkbox"
                        checked={visibleColumns[perspective]?.includes('cadastre') ?? false}
                        onChange={(e) => handleCheckboxChange('cadastre', e.target.checked)}
                    />
                    Matrikkel
                </label>
            </div>}
            {facetConfig[perspective]?.filter(item => item.label && item.label.toLowerCase().includes(columnFilter.toLowerCase())).map((facet: any) => (
                <div key={facet.key}>
                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            checked={visibleColumns[perspective]?.includes(facet.key) ?? false}
                            onChange={(e) => handleCheckboxChange(facet.key, e.target.checked)}
                        />
                        {facet.label}
                    </label>
                </div>
            ))}

        </div>
    </div>



}