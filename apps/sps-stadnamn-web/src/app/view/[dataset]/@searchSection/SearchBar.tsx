import { useSearchParams } from "next/navigation"
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";
import { useState, useRef } from "react";


export default function SearchBar() {
    const searchParams = useSearchParams()

    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const clearInput = () => {
        setInputValue('')
        inputRef.current?.focus()
    }


    return (
        <div className="flex gap-2 px-2">
            <div className="relative w-full h-full">
            <input type="text" 
                   ref={inputRef}
                   name="q" 
                   value={inputValue} 
                   onChange={(event) => setInputValue(event.target.value)}    
                   className='border border-neutral-500 w-full h-full rounded-sm px-2'/>
            { inputValue && 
            <IconButton type="button" onClick={clearInput} label="Tøm søk" className="absolute right-2 top-1/2 transform -translate-y-1/2"><PiX className="text-lg"/></IconButton> }
            </div>
            <IconButton type="submit" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
    )

}
