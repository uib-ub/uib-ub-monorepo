import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { parseAsString, useQueryState } from "nuqs";
import { PiCheck, PiFaders } from "react-icons/pi";


export default function Options() {
    const [fulltext, setFulltext] = useQueryState('fulltext', parseAsString.withDefault('off'))
    const toggleFulltext = () => {
        setFulltext(prev => prev == 'on' ? 'off' : 'on');
    };
    return <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button aria-label="Søkealternativ" className="p-1 px-2 rounded-sm items-center flex h-full border-neutral-200">
                    <span className="relative">
                        <PiFaders className="text-2xl" aria-hidden="true"/>
                        {fulltext === 'on' && (
                            <div className="absolute -top-1 -right-1 w-[6px] h-[6px] bg-red-500 rounded-full" aria-hidden="true" />
                        )}
                    </span>
                </button>
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

    
}