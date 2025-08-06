import { PiArrowCounterClockwise, PiCaretDown, PiCaretDownBold, PiSortAscending, PiSortDescending, PiTrash } from "react-icons/pi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { facetConfig } from "@/config/search-config"
import { usePerspective } from "@/lib/search-params"
import { contentSettings } from "@/config/server-config"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"

export default function SortSelector() {
    const searchParams = useSearchParams()
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const perspective = usePerspective()

    // Build sort options from facet config
    const sortOptions = [
        { field: "label.keyword", label: "Oppslagsord" },
        // Add administrative areas if configured
        ...(contentSettings[perspective]?.adm ? [{
            field: Array.from({length: contentSettings[perspective]?.adm || 0}, 
                (_, i) => `adm${i+1}.keyword`).join(","),
            label: "Område"
        }] : []),
        // Add cadastre if configured
        ...(contentSettings[perspective]?.cadastre ? [{
            field: 'cadastre__gnr,cadastre__bnr',
            label: "Matrikkel"
        }] : []),
        // Add fields from facet config
        ...(facetConfig[perspective]?.filter(item => item.table)?.map(facet => ({
            field: facet.type ? facet.key : facet.key.replace("__", ".") + ".keyword",
            label: facet.label
        })) || [])
    ]

    const currentSort = asc || desc
    const currentLabel = sortOptions.find(opt => opt.field === currentSort)?.label


    return (
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button 
                        type="button" 
                        className="btn btn-outline btn-compact pl-2"
                    >
                        <PiCaretDownBold className="text-xl mr-2"/>
                        Sorter{currentLabel ? `: ${currentLabel}` : ''}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[4000] bg-white p-2 rounded-md shadow-md">
                    <DropdownMenuLabel className="font-semibold px-4 py-2">Sorter etter:</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => (
                        <DropdownMenuItem asChild key={option.field}>
                        <Clickable
                            className={`cursor-pointer px-4 py-2 ${option.field === currentSort ? 'bg-neutral-50' : ''}`}
                            add={option.field === currentSort ? {asc: null, desc: null} : {asc: option.field, desc: null}}
                        >
                            {option.label}
                        </Clickable>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {currentSort && (
                <>
                    <ClickableIcon
                        className="btn btn-outline btn-compact" 
                        add={desc ? {asc: currentSort, desc: null} : {asc: null, desc: currentSort}}
                        label={desc ? "Sorter stigende" : "Sorter synkende"}
                    >
                        {desc ? <PiSortDescending className="text-xl"/> : <PiSortAscending className="text-xl"/>}
                    </ClickableIcon>

                    <ClickableIcon 
                        className="btn btn-outline btn-compact" 
                        add={{asc: null, desc: null}}
                        label="Tilbakestill sortering"
                    >
                        <PiTrash className="text-xl"/>
                    </ClickableIcon>
                </>
            )}
        </div>
    )
} 