'use client'
import { useState, useRef, useEffect, useContext } from "react";
import { PiArchive, PiBookOpen, PiBookOpenLight, PiBookOpenText, PiBookOpenTextFill, PiBookOpenTextLight, PiCaretLeft, PiChatCircleText, PiDatabaseFill, PiDatabaseLight, PiHouse, PiInfo, PiList, PiListFill, PiListLight, PiMapPinLineFill, PiMapTrifold, PiMapTrifoldFill, PiMapTrifoldLight, PiMicroscopeFill, PiMicroscopeLight, PiPersonArmsSpread, PiQuestion, PiTable, PiTableFill, PiTableLight, PiTreeViewFill, PiTreeViewLight, PiWallFill, PiWallLight, PiX } from 'react-icons/pi';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "../state/providers/global-provider";
import Link from "next/link";
import Clickable from "@/components/ui/clickable/clickable";
import { useMode } from "@/lib/param-hooks";
import { useSessionStore } from "../state/zustand/session-store";
import { infoPages } from "./info/info-pages";

export default function Menu( { shadow }: { shadow?: boolean } ) {
    const menuOpen = useSessionStore((s) => s.menuOpen)
    const setMenuOpen = useSessionStore((s) => s.setMenuOpen)
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { currentUrl, isMobile } = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')
    const mode = useMode()
    const modeOutsideSearch = pathname == '/search' ? mode : null
    const router = useRouter()
    const q = searchParams.get("q")
    const datasetTag = searchParams.get("datasetTag")
	const setDrawerContent = useSessionStore((s) => s.setDrawerContent)

	const menuBtn = "flex w-24 h-16  p-2 text-sm flex-col items-center justify-center gap-1 rounded-lg aria-selected:text-white aria-selected:bg-accent-800 no-underline"

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
    }, [q, pathname]);





    return (
        <div ref={menuRef} className={`flex items-center justify-center h-full`} style={{zIndex: menuOpen ? 10000 : 10000}}>
            <button id="menu-button" aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        aria-label="Meny"
                        aria-expanded={menuOpen} 
                        className={`items-center justify-center flex aspect-square bg-neutral-50 z-[60000] ${menuOpen ? 'fixed top-0 left-0 w-14 h-14 ' : 'h-full w-full xl:rounded-l-md'}${shadow ? ' shadow-lg border-r border-neutral-200' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <PiX className="text-3xl xl:text-2xl" aria-hidden="true"/> : <PiList className="text-3xl xl:text-2xl" aria-hidden="true"/>}</button>
 
                <div 
                     id="menu_navbar" 
                     className={`bg-neutral-50 w-[calc(100svw-5rem)] xl:w-[calc(25svw-0.5rem)] xl:rounded-r-md shadow-lg overscroll-none h-[100svh] overflow-y-auto fixed top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                         
                <nav id="top" className="text-xl pb-6 flex flex-col" onBlur={handleBlur}>
                <div className="flex items-center ml-14 h-14 px-2">
                    <Link href="/" className="text-xl no-underline">stadnamn.no</Link>
            
            </div>
                
				<div className="flex flex-col gap-2 p-3 w-full ">
                        <h1 className="text-lg">Stadnamnsøk</h1>		
					<div className="flex gap-2 items-center w-full pb-3 text-base" role="tablist">
					
					<Clickable link href="/search" role="tab" onClick={() => setMenuOpen(false)} aria-selected={modeOutsideSearch == 'map'} add={{mode: 'map'}} className={menuBtn}>
						{modeOutsideSearch == 'map' ? <PiMapTrifoldFill className="text-xl text-white" /> : <PiMapTrifoldLight className="text-xl" />}
						Kart
					</Clickable>
					<Clickable link href="/search" role="tab" onClick={() => setMenuOpen(false)} aria-selected={modeOutsideSearch == 'table'} add={{mode: 'table'}} className={menuBtn}>
						{modeOutsideSearch == 'table' ? <PiTableFill className="text-xl text-white" /> : <PiTableLight className="text-xl" />}
						Tabell
					</Clickable>
					<Clickable link href="/search" role="tab" onClick={() => setMenuOpen(false)} aria-selected={modeOutsideSearch == 'list'} add={{mode: 'list'}} className={menuBtn}>
						{modeOutsideSearch == 'list' ? <PiBookOpenTextFill className="text-xl text-white" /> : <PiBookOpenTextLight className="text-xl" />}
						Liste
					</Clickable>
					</div>
                    </div>
                    <Link scroll={false} className="flex items-center gap-2 py-3 px-4 lg:mx-0" href="/help"><PiQuestion aria-hidden="true"/>Søketips</Link>
                    
                    {false && <div className="flex flex-col gap-2 p-3 w-full">
                    <span className="text-lg">Søkemodus</span>
                    <div className="flex gap-2 items-center w-full pb-3 text-base flex-wrap" role="tablist">
                        
							<Clickable
								remove={["datasetTag"]}
								add={{nav: 'datasets'}}
								role="tab"
								aria-selected={!datasetTag && pathname == "/search"}
								className={menuBtn}
                                onClick={() => {setMenuOpen(false); setDrawerContent('datasets')}}
							>
								<span className="flex-shrink-0">
									{!datasetTag && pathname == "/search" ? <PiDatabaseFill className="text-xl text-white" aria-hidden="true"/> : <PiDatabaseLight className="text-xl" aria-hidden="true"/>}
								</span>
								Alle datasett
							</Clickable>
							<Clickable
								role="tab"
								remove={["dataset", "group", "doc"]}
								add={{ datasetTag: 'deep' , nav: 'datasets'}}
                                onClick={() => {setMenuOpen(false); setDrawerContent('datasets')}}
								aria-selected={datasetTag == 'deep'}
								className={menuBtn}
							>
								<span className="flex-shrink-0">
									{datasetTag == 'deep' ? <PiMicroscopeFill className="text-xl text-white" aria-hidden="true"/> : <PiMicroscopeLight className="text-xl" aria-hidden="true"/>}
								</span>
								Djup&shy;innsamlingar
							</Clickable>
							<Clickable
								role="tab"
								remove={["dataset", "group", "doc"]}
								add={{ datasetTag: 'tree' , nav: 'tree'}}
                                onClick={() => {setMenuOpen(false); setDrawerContent('tree')}}
								aria-selected={datasetTag == 'tree'}
								className={menuBtn}
							>
								<span className="flex-shrink-0">
									{datasetTag == 'tree' ? <PiTreeViewFill className="text-xl text-white" aria-hidden="true"/> : <PiTreeViewLight className="text-xl" aria-hidden="true"/>}
								</span>
								Matriklar
							</Clickable>
							<Clickable
								role="tab"
								remove={["dataset", "group", "doc"]}
								add={{ datasetTag: 'base' , nav: 'datasets'}}
                                onClick={() => {setMenuOpen(false); setDrawerContent('datasets')}}
								aria-selected={datasetTag == 'base'}
								className={menuBtn}
							>
								<span className="flex-shrink-0">
									{datasetTag == 'base' ? <PiWallFill className="text-xl text-white" aria-hidden="true"/> : <PiWallLight className="text-xl" aria-hidden="true"/>}
								</span>
								Grunnord
							</Clickable>
						
                        </div>
                    </div>}
                    
                    
                    <Link scroll={false} className="flex items-center gap-2 py-3 px-4 lg:mx-0" href="https://skjemaker.app.uib.no/view.php?id=16665712"><PiChatCircleText aria-hidden="true"/>Tilbakemelding</Link>
					<Link scroll={false} className="flex items-center gap-2 py-3 px-4 lg:mx-0" href="/iiif"><PiArchive aria-hidden="true"/>Arkiv</Link>
                   <div className="flex flex-col w-full">
                    <Link scroll={false} className="flex items-center gap-2 py-3 px-4 lg:mx-0" href="/info"><PiInfo aria-hidden="true"/>Informasjon</Link>
					<Link scroll={false} className="flex items-center gap-2 py-3 px-4 pl-10 lg:mx-0" href="/info/privacy">Personvern</Link>
					<Link scroll={false} className="flex items-center gap-2 py-3 px-4 pl-10 lg:mx-0" href="/info/license">Opphavsrett</Link>
					
                    </div>
                    <Link scroll={false} className="flex items-center gap-2 py-3 px-4 lg:mx-0" href="https://uustatus.no/nn/erklaringer/publisert/c3abf798-49b7-4776-b1ee-f07b46dadd38"><PiPersonArmsSpread aria-hidden="true"/>Tilgjengeerklæring</Link>
                    
      
                </nav>
                </div>
				

               
        </div>
    )

}