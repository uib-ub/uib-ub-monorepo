import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation"
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";
import { useState, useRef } from "react";
import { useQueryStringWithout } from "@/lib/search-params";
import { fieldConfig } from "@/config/dataset-config";

export default function SearchBar() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const clearedQuery = useQueryStringWithout(['q', 'page'])
    const pathname = usePathname()
    const params = useParams()
    const dataset = params.dataset == 'search' ? '*' : params.dataset as string;

    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const clearInput = () => {
        router.push(pathname + clearedQuery ? '?' + clearedQuery : '', { scroll: false })
        setInputValue('')
        inputRef.current?.focus()
    }

    const changeField = (event: any) => {
        const field = event.target.value;
        const params = new URLSearchParams(location.search);
        params.set('field', field);
        const newUrl = pathname + '?' + params.toString();
        router.push(newUrl);
    }



    return (
        <>
        <div className="flex gap-2 px-2 items-stretch">
            <div className="border border-neutral-500 relative w-full rounded-sm">
                <div className="flex w-full h-full">
                {fieldConfig[dataset] &&
                <select name="field" value={searchParams.get('field') || fieldConfig[dataset][0].key} className="m-2"  onChange={changeField}>
                    {fieldConfig[dataset].map((field: any) => <option key={field.key} value={field.key}>{field.label}</option>)}
                </select>}
                <input type="text" 
                   ref={inputRef}
                   name="q" 
                   value={inputValue} 
                   onChange={(event) => setInputValue(event.target.value)}    
                   className='!w-full !h-full px-2 border-l border-neutral-300 focus:outline-none'/>
            </div>
            { inputValue && 
            <IconButton type="button" onClick={clearInput} label="Tøm søk" className="absolute right-2 top-1/2 transform -translate-y-1/2"><PiX className="text-lg"/></IconButton> }
            </div>
            <IconButton type="submit" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
        </>
    )

}

