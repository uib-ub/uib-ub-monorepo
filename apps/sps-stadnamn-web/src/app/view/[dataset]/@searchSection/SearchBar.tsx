import { useSearchParams, useRouter, useParams } from "next/navigation"
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import IconButton from "@/components/ui/icon-button";
import { useState, useRef } from "react";
import { useQueryStringWithout } from "@/lib/search-params";
import { fieldConfig } from "@/config/search-config";
import Spinner from "@/components/svg/Spinner";

export default function SearchBar({showLoading}: {showLoading?: boolean}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const clearedQuery = useQueryStringWithout(['q', 'page'])
    const params = useParams()
    const dataset = params.dataset as string// params.dataset == 'search' ? '*' : params.dataset as string;

    const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const clearInput = () => {
        router.push(`/view/${dataset}${clearedQuery ? '?' + clearedQuery : ''}`, { scroll: false })
        setInputValue('')
        inputRef.current?.focus()
    }

    const changeField = (event: any) => {
        const field = event.target.value;
        const params = new URLSearchParams(location.search);
        if (field) {
            params.set('field', field);
            params.delete('page');
        }
        else {
            params.delete('field');
            params.delete('page');
        }
        
        const newUrl = `/view/${dataset}?${params.toString()}`;
        router.push(newUrl);
    }



    return (
        <>
        <div className="flex gap-2 px-4 items-stretch">
            <div className="border border-neutral-500 relative w-full rounded-sm">
                <div className="flex w-full h-full">
                {fieldConfig[dataset] &&
                <select name="field" value={searchParams.get('field') || fieldConfig[dataset][0].key} className="h-full mx-1"  onChange={changeField}>
                    {fieldConfig[dataset].map((field: any) => <option key={field.key} value={field.key == 'label' ? '' : field.key}>{field.label}</option>)}
                </select>}
                <input type="text" 
                   aria-label="Søk"
                   ref={inputRef}
                   name="q" 
                   value={inputValue} 
                   onChange={(event) => setInputValue(event.target.value)}    
                   className={`!w-full !h-full px-2 focus:outline-none ${fieldConfig[dataset] ? 'border-l border-neutral-300' : ''}`}/>
            </div>
            { showLoading && <Spinner status="Laster inn treff" className='absolute right-8 top-1/4 w-[1em] h-[1em}'/> }
            { inputValue && 
            <IconButton type="button" onClick={clearInput} label="Tøm søk" className="absolute right-2 top-1/2 transform -translate-y-1/2"><PiX className="text-lg"/></IconButton> }
            </div>
            <IconButton type="submit" label="Søk" className='btn btn-primary text-lg'><PiMagnifyingGlass className="text-lg"/></IconButton>
        </div>
        </>
    )

}

