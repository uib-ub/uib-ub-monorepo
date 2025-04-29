'use client'
import { useSearchParams } from "next/navigation"
import { PiSortAscending, PiSortDescending } from "react-icons/pi"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { useQueryState } from "nuqs"


export default function SortHeader({ field, label, description }: { field: string, label: string, description?: string }) {
    const searchParams = useSearchParams()
    const [desc, setDesc] = useQueryState('desc')
    const [asc, setAsc] = useQueryState('asc')
    const [page, setPage] = useQueryState('page')


    const sortToggle = (field: string) => {
        if (page) {
            setPage(null)
        }
        if (asc == field) {
            setAsc(null)
            setDesc(field)
        }
        else if (desc == field) {
            setDesc(null)
        }
        else {
            setAsc(field)
        }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className="flex gap-1 items-center" type="button" onClick={() => sortToggle(field)}>
                    <span className="uppercase"> {label}</span>
                    { searchParams.get('asc') == field && <PiSortAscending className='text-xl inline ml-2' aria-hidden="true"/>}
                    { searchParams.get('desc') == field && <PiSortDescending className='text-xl inline ml-2' aria-hidden="true"/>}
                    
                </TooltipTrigger>
                <TooltipContent>
                {description ? description + ": " : ''}{searchParams.get('asc') == field && 'Sorter synkende' || searchParams.get('desc') == field && 'Fjern sortering' || 'Sorter stigende'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    )
}