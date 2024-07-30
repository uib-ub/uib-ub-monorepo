import { useSearchParams, useParams, useRouter } from "next/navigation"
import { PiSortAscending, PiSortDescending } from "react-icons/pi"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"


export default function SortButton({ field, label, description }: { field: string, label: string, description?: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const params = useParams()

    const sortToggle = (field: string) => {
        const newParams = new URLSearchParams(searchParams)

        newParams.delete('page')
        
        if (newParams.get('asc') == field) {
            newParams.delete('asc')
            newParams.set('desc', field)
        }
        else if (newParams.get('desc') == field) {
            newParams.delete('desc')
        }
        else if (newParams.get('asc') != field) {
            newParams.delete('asc')
            newParams.delete('desc')
            newParams.set('asc', field)
        }
        router.push(`/view/${params.dataset}?${newParams.toString()}`)
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className="flex gap-1 items-center" type="button" onClick={() => sortToggle(field)}>
                    <span className="small-caps text-xl"> {label}</span>
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