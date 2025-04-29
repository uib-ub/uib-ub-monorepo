import { useQueryState } from "nuqs"
import { PiArrowCounterClockwise, PiCaretDown, PiSortAscending, PiSortDescending } from "react-icons/pi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { facetConfig } from "@/config/search-config"
import { useDataset } from "@/lib/search-params"
import { contentSettings } from "@/config/server-config"

export default function SortSelector() {
    const [asc, setAsc] = useQueryState('asc')
    const [desc, setDesc] = useQueryState('desc')
    const dataset = useDataset()

    // Build sort options from facet config
    const sortOptions = [
        { field: "label.keyword", label: "Oppslagsord" },
        // Add administrative areas if configured
        ...(contentSettings[dataset]?.adm ? [{
            field: Array.from({length: contentSettings[dataset]?.adm || 0}, 
                (_, i) => `adm${i+1}.keyword`).join(","),
            label: "Område"
        }] : []),
        // Add cadastre if configured
        ...(contentSettings[dataset]?.cadastre ? [{
            field: 'cadastre__gnr,cadastre__bnr',
            label: "Matrikkel"
        }] : []),
        // Add fields from facet config
        ...(facetConfig[dataset]?.filter(item => item.table)?.map(facet => ({
            field: facet.type ? facet.key : facet.key.replace("__", ".") + ".keyword",
            label: facet.label
        })) || [])
    ]

    const currentSort = asc || desc
    const currentLabel = sortOptions.find(opt => opt.field === currentSort)?.label

    const toggleSortOrder = () => {
        if (!currentSort) return
        if (desc) {
            setDesc(null)
            setAsc(currentSort)
        } else if (asc) {
            setAsc(null)
            setDesc(currentSort)
        }
    }

    const handleSort = (field: string) => {
        // Default to descending for new sort field
        if (field !== currentSort) {
            setDesc(field)
            setAsc(null)
        }
    }

    return (
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button 
                        type="button" 
                        className="btn btn-outline btn-compact pl-2"
                    >
                        <PiCaretDown className="text-xl mr-2"/>
                        Sorter{currentLabel ? `: ${currentLabel}` : ''}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[4000] bg-white p-2 rounded-md shadow-md">
                    <DropdownMenuLabel className="font-semibold px-4 py-2">Sorter etter:</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.field}
                            className={`cursor-pointer px-4 py-2 ${option.field === currentSort ? 'bg-neutral-50' : ''}`}
                            onClick={() => handleSort(option.field)}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {currentSort && (
                <>
                    <button 
                        type="button" 
                        className="btn btn-outline btn-compact" 
                        onClick={toggleSortOrder}
                        aria-label={desc ? "Sorter stigende" : "Sorter synkende"}
                    >
                        {desc ? <PiSortDescending className="text-xl"/> : <PiSortAscending className="text-xl"/>}
                    </button>

                    <button 
                        type="button" 
                        className="btn btn-outline btn-compact" 
                        onClick={() => {
                            setAsc(null)
                            setDesc(null)
                        }}
                        aria-label="Tilbakestill sortering"
                    >
                        <PiArrowCounterClockwise className="text-xl"/>
                    </button>
                </>
            )}
        </div>
    )
} 