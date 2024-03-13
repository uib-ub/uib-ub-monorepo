import { useSearchParams } from "next/navigation"
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";


export default function SearchBar() {
    const searchParams = useSearchParams()

    return (
        <div className="flex gap-2 px-2">
            <input type="text" form="search_form" name="q" defaultValue={searchParams.get('q') || ''} className='border border-neutral-500 w-full rounded-sm px-2'/>
            <IconButton type="submit" form="search_form" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
    )

}

