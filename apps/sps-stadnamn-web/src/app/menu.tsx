'use client'
import { useState, useRef, useEffect, useContext } from "react";
import { PiArchive, PiBookOpen, PiBookOpenLight, PiBookOpenText, PiBookOpenTextFill, PiBookOpenTextLight, PiCaretLeft, PiChatCircleText, PiHouse, PiInfo, PiList, PiListFill, PiListLight, PiMapPinLineFill, PiMapTrifold, PiMapTrifoldFill, PiMapTrifoldLight, PiQuestion, PiTable, PiTableFill, PiTableLight, PiX } from 'react-icons/pi';
import NavBar from "./nav-bar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "./global-provider";
import Link from "next/link";
import Clickable from "@/components/ui/clickable/clickable";
import { useMode } from "@/lib/param-hooks";
import FulltextToggle from "./fulltext-toggle";

export default function Menu( { shadow }: { shadow?: boolean } ) {
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
        <div ref={menuRef} className="bg-neutral-50 xl:bg-transparent z-[6000] py-2 flex items-center justify-center h-full">
            <button id="menu-button" aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        aria-label="Meny"
                        aria-expanded={menuOpen} 
                        className={`items-center justify-center flex h-full w-12 xl:w-10 ml-1.5 mr-0.5 ${shadow ? 'xl:bg-neutral-50 rounded-lg' : ''}`} 
                        onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <PiX className="text-2xl" aria-hidden="true"/> : <PiList className="text-2xl" aria-hidden="true"/>}</button>
 
                <div 
                     id="menu_navbar" 
                     className={` bg-neutral-50 px-3 w-full xl:w-[25svw] overscroll-none h-[calc(100svh-3rem)] border-t border-neutral-200 overflow-y-auto ${menuOpen ? 'fixed top-14 bottom-0 left-0' : 'hidden'}`}>
                         { pathname !== '/' && pathname != '/search' && currentUrl.current && 
                <div className="flex items-center justify-center py-4 border-b border-neutral-200 gap-2 no-underline text-xl "><Link href={currentUrl.current} className="flex items-center gap-2 no-underline text-xl"><PiCaretLeft className="text-2xl"/>Tilbake til søket</Link></div>
                }
                <div className="flex flex-col gap-2 p-3 w-full">
                    <FulltextToggle/>
                    
                    <div className="flex gap-2 items-center w-full">
                   
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
                    </div>
                <nav id="top" className="text-2xl py-6 px-3 flex flex-col border-t border-neutral-200" onBlur={handleBlur}>
                    {pathname == "/search" && <Link scroll={false} className="flex items-center gap-2 py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="/"><PiHouse aria-hidden="true"/>Til forsiden</Link>}
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="/help"><PiQuestion aria-hidden="true"/>Søketips</Link>
                   
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="https://skjemaker.app.uib.no/view.php?id=16665712"><PiChatCircleText aria-hidden="true"/>Tilbakemelding</Link>
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:py-0 lg:my-1 lg:px-4 lg:pr-8 lg:mx-0" href="/info"><PiInfo aria-hidden="true"/>Info</Link>
      

                </nav>
                </div>

               
        </div>
    )

}