import { useDataset } from "@/lib/search-params";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { parseAsString, useQueryState } from "nuqs";
import { PiCheck, PiFaders } from "react-icons/pi";


export default function Options() {
    const [fulltext, setFulltext] = useQueryState('fulltext', parseAsString.withDefault('off'))
    const dataset = useDataset()
    const toggleFulltext = () => {
        setFulltext(prev => prev == 'on' ? 'off' : 'on');
    };
    return true ? 
        <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button aria-label="Søk i" className="p-1 px-2 rounded-sm items-center flex h-full border-r-2 border-neutral-200">
                <PiFaders className="text-3xl" aria-hidden="true"/></button>
                    </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[4000] bg-white p-2 rounded-md shadow-md">
                  <DropdownMenuLabel className="font-semibold px-4 py-2">Søk i:</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                    <DropdownMenuRadioGroup value={fulltext} onValueChange={toggleFulltext}>
                         <DropdownMenuRadioItem key="default" value="" className="text-nowrap cursor-pointer px-4 py-2">
                        Stadnamn {fulltext == 'off' && <span className="ml-auto"><PiCheck className="text-lg inline" aria-hidden="true"/></span>}
                        </DropdownMenuRadioItem>

                        <DropdownMenuRadioItem key="fulltext" value="on" className="text-nowrap cursor-pointer px-4 py-2">
                          Fulltekst {fulltext == 'on' && <span className="ml-auto"><PiCheck className="text-lg inline" aria-hidden="true"/></span>}
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  
                </DropdownMenuContent>
        </DropdownMenu>
        : 
        <label className="flex items-center gap-2">
                    <input type="checkbox" name="fulltext" checked={fulltext == 'on'} onChange={toggleFulltext}
                    className="h-4 w-4"/>
                    <span>Fulltekst</span>
                </label> 
    
}