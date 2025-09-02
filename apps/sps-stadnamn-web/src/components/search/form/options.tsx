import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

import { PiCheck, PiFaders } from "react-icons/pi";


export default function Options() {
    const searchParams = useSearchParams()
    const fulltext = searchParams.get('fulltext') || 'off'
    const router = useRouter()
    
    const toggleFulltext = () => {
        const params = new URLSearchParams(searchParams);
        params.set('fulltext', fulltext == 'on' ? 'off' : 'on');
        router.push(`?${params.toString()}`);
    };
    return <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button aria-label="Søkealternativ" className="items-center flex justify-center h-full border-neutral-200 !w-14 xl:w-12 border-l-2 border-neutral-200 xl:border-none shrink-0">
                    <PiFaders className="text-3xl" aria-hidden="true"/>

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