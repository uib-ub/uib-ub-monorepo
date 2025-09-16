'use client'
import { useState, useRef, useEffect, useContext } from "react";
import { PiBookOpen, PiBookOpenLight, PiBookOpenText, PiBookOpenTextFill, PiBookOpenTextLight, PiCaretLeft, PiList, PiListFill, PiListLight, PiMapPinLineFill, PiMapTrifoldFill, PiMapTrifoldLight, PiTableFill, PiTableLight } from 'react-icons/pi';
import NavBar from "./nav-bar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "./global-provider";
import Link from "next/link";
import Clickable from "@/components/ui/clickable/clickable";
import { useMode } from "@/lib/param-hooks";
import FulltextToggle from "./fulltext-toggle";

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { currentUrl, isMobile } = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')
    const mode = useMode()
    const modeOutsideSearch = pathname == '/search' ? mode : null
    const router = useRouter()
    const q = searchParams.get("q")

    const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
        if (menuRef.current) {
            if (!menuRef.current.contains(event.relatedTarget as Node)) {
                setMenuOpen(false);
            }
        }
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [q, mode, pathname]);





    return (
        <div ref={menuRef} className="xl:hidden !ml-auto !z-[7000] flex gap-1 items-center justify-center h-full border-l-2 border-neutral-200 xl:border-none">
            <button aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        aria-label="Meny"
                        aria-expanded={menuOpen} 
                        className="items-center justify-center flex h-full w-14 xl:w-12" 
                        onClick={() => setMenuOpen(!menuOpen)}>
                <PiList className="text-3xl"/></button>
 
                <div 
                     id="menu_navbar" 
                     className={` bg-neutral-50 overscroll-none h-[calc(100svh-3rem)] border-t border-neutral-200 overflow-y-auto ${menuOpen ? 'fixed top-14 bottom-0 left-0 right-0' : 'hidden'}`}>
                         { pathname !== '/' && pathname != '/search' && currentUrl.current && 
                <div className="flex items-center justify-center py-4 border-b border-neutral-200 gap-2 no-underline text-xl "><Link href={currentUrl.current} className="flex items-center gap-2 no-underline text-xl"><PiCaretLeft className="text-2xl"/>Tilbake til søket</Link></div>
            }
                {isMobile && <div className="flex flex-col gap-3 justify-center py-3 w-full">
                    <FulltextToggle/>
                    
                    <div className="flex gap-3 items-center justify-center w-full">
                   
                    <Clickable link href="/search" aria-current={modeOutsideSearch == 'map' ? 'page' : undefined} add={{mode: 'map'}} className="flex w-24 h-24 p-3 flex-col items-center justify-center gap-2 rounded-lg aria-[current=page]:text-white aria-[current=page]:bg-accent-800 no-underline">
                        {modeOutsideSearch == 'map' ? <PiMapTrifoldFill className="text-4xl text-white" /> : <PiMapTrifoldLight className="text-4xl" />}
                        Kart
                    </Clickable>
                    <Clickable link href="/search" aria-current={modeOutsideSearch == 'table' ? 'page' : undefined} add={{mode: 'table'}} className="flex w-24 h-24 p-3 flex-col items-center justify-center gap-2 rounded-lg aria-[current=page]:text-white aria-[current=page]:bg-accent-800 no-underline">
                        {modeOutsideSearch == 'table' ? <PiTableFill className="text-4xl text-white" /> : <PiTableLight className="text-4xl" />}
                        Tabell
                    </Clickable>
                    <Clickable link href="/search" aria-current={modeOutsideSearch == 'list' ? 'page' : undefined} add={{mode: 'list'}} className="flex w-24 h-24 p-3 flex-col items-center justify-center gap-2 rounded-lg aria-[current=page]:text-white aria-[current=page]:bg-accent-800 no-underline">
                        {modeOutsideSearch == 'list' ? <PiBookOpenTextFill className="text-4xl text-white" /> : <PiBookOpenTextLight className="text-4xl" />}
                        Liste
                    </Clickable>
                    </div>
                    </div>}
                <NavBar 
                        onBlur={handleBlur}
                        className=" xl:hidden text-3xl text-center py-6 uppercase flex flex-col w-full border-t border-neutral-200 tracking-wider "/>
                </div>
               
        </div>
    )

}