'use client'
import { useSearchParams } from "next/navigation"
import { PiSortAscending, PiSortDescending } from "react-icons/pi"

import Clickable from "@/components/ui/clickable/clickable"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


export default function SortHeader({ field, label, description }: { field: string, label: string, description?: string }) {
    const searchParams = useSearchParams()
    const desc = searchParams.get('desc')
    const asc = searchParams.get('asc')
    const page = searchParams.get('page')


    const sortToggle = (field: string): Record<string, string | null> => {
        if (page) {
            return { page: null }
        }
        if (asc == field) {
            return { asc: null, desc: field }
        }
        else if (desc == field) {
            return { desc: null }
        }
        return { asc: field }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Clickable className="flex gap-1 items-center" add={sortToggle(field)}>
                        <span className="uppercase"> {label}</span>
                        {searchParams.get('asc') == field && <PiSortAscending className='text-xl inline ml-2' aria-hidden="true" />}
                        {searchParams.get('desc') == field && <PiSortDescending className='text-xl inline ml-2' aria-hidden="true" />}
                    </Clickable>
                </TooltipTrigger>
                <TooltipContent>
                    {description ? description + ": " : ''}{searchParams.get('asc') == field && 'Sorter synkende' || searchParams.get('desc') == field && 'Fjern sortering' || 'Sorter stigende'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    )
}