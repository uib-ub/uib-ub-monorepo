import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PiMagnifyingGlass, PiSlidersHorizontal, PiX } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";
import { useState, useRef } from "react";
import { useQueryStringWithout } from "@/lib/search-params";

export default function SearchBar() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const clearedQuery = useQueryStringWithout(['q', 'page'])
    const pathname = usePathname()

    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const clearInput = () => {
        router.push(pathname + clearedQuery ? '?' + clearedQuery : '', { scroll: false })
        setInputValue('')
        inputRef.current?.focus()
    }

    const changeField = (event: any) => {
        // Get the field value
        const field = event.target.value;
    
        // Get the current search params
        const params = new URLSearchParams(location.search);
    
        if (field !== 'label') {
            // If the field value is not 'label', add or replace the 'field' parameter
            params.set('field', field);
        } else {
            // If the field value is 'label', remove the 'field' parameter
            params.delete('field');
        }
    
        // Create the new URL
        const newUrl = pathname + '?' + params.toString();
    
        // Navigate to the new URL
        router.push(newUrl);
    }



    return (
        <>
        <div className="flex gap-2 px-2 items-stretch">
            <div className="border border-neutral-500 w-full !h-full rounded-sm flex">
                <select name="field" value={searchParams.get('field') || 'label'} className="m-2"  onChange={changeField}>
                    <option value="label">Namn</option>
                    <option value="rawData.merknader">Merknader</option>
                </select>
            <input type="text" 
                   ref={inputRef}
                   name="q" 
                   value={inputValue} 
                   onChange={(event) => setInputValue(event.target.value)}    
                   className='!w-full relative h-full px-2 border-l border-neutral-300 focus:outline-none'/>
            { inputValue && 
            <IconButton type="button" onClick={clearInput} label="Tøm søk" className="absolute right-2 top-1/2 transform -translate-y-1/2"><PiX className="text-lg"/></IconButton> }
            </div>
            <IconButton type="submit" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
        </>
    )

}

