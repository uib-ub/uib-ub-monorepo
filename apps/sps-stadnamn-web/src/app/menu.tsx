'use client'
import { useState, useRef, useEffect, useContext } from "react";
import { PiArchive, PiBookOpen, PiBookOpenLight, PiBookOpenText, PiBookOpenTextFill, PiBookOpenTextLight, PiCaretLeft, PiChatCircleText, PiDatabaseFill, PiDatabaseLight, PiHouse, PiInfo, PiList, PiListFill, PiListLight, PiMapPinLineFill, PiMapTrifold, PiMapTrifoldFill, PiMapTrifoldLight, PiMicroscopeFill, PiMicroscopeLight, PiQuestion, PiTable, PiTableFill, PiTableLight, PiTreeViewFill, PiTreeViewLight, PiWallFill, PiWallLight, PiX } from 'react-icons/pi';
import NavBar from "./nav-bar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlobalContext } from "./global-provider";
import Link from "next/link";
import Clickable from "@/components/ui/clickable/clickable";
import { useMode } from "@/lib/param-hooks";
import FulltextToggle from "./fulltext-toggle";
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
        <div ref={menuRef} className={`${menuOpen ? 'z-[6000]' : 'z-[3000]'} flex items-center justify-center h-full`}>
            <button id="menu-button" aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        aria-label="Meny"
                        aria-expanded={menuOpen} 
                        className={`items-center justify-center flex h-full aspect-square xl:rounded-md bg-neutral-50 ${shadow ? 'shadow-lg border-r-2 xl:border-r-0  border-neutral-200' : ''}`} 
                        onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <PiX className="text-3xl xl:text-2xl" aria-hidden="true"/> : <PiList className="text-3xl xl:text-2xl" aria-hidden="true"/>}</button>
 
                <div 
                     id="menu_navbar" 
                     className={` bg-neutral-50 px-2 w-full xl:w-[25svw] overscroll-none h-[calc(100svh-3rem)] overflow-y-auto ${menuOpen ? 'fixed top-14 bottom-0 left-0' : 'hidden'}`}>
                         { pathname !== '/' && pathname != '/search' && currentUrl.current && 
                <div className="flex items-center justify-center py-4 border-b border-neutral-200 gap-2 no-underline text-xl "><Link href={currentUrl.current} className="flex items-center gap-2 no-underline text-xl"><PiCaretLeft className="text-2xl"/>Tilbake til søket</Link>
                </div>
                }
                <nav id="top" className="text-xl py-6 flex flex-col divide-y divide-neutral-200" onBlur={handleBlur}>
                    {pathname != "/" && <Link scroll={false} className="flex items-center gap-2 py-3 lg:px-4 lg:mx-0" href="/"><PiHouse aria-hidden="true"/>Til forsida</Link>}
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:px-4 lg:mx-0" href="/help"><PiQuestion aria-hidden="true"/>Søketips</Link>
                    <div className="flex flex-col gap-2 p-3 w-full">
                        <span className="text-lg">Resultatvisning</span>		
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
                    <div className="flex flex-col gap-2 p-3 w-full">
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
                    </div>
                    
                   
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:px-4 lg:mx-0" href="https://skjemaker.app.uib.no/view.php?id=16665712"><PiChatCircleText aria-hidden="true"/>Tilbakemelding</Link>
                    					
                   <div className="flex flex-col gap-2 w-full">
                    <Link scroll={false} className="flex items-center gap-2 py-3 lg:px-4 lg:pr-8 lg:mx-0" href="/info"><PiInfo aria-hidden="true"/>Om stadnamnportalen</Link>
					<ul className="flex flex-col gap-0 pb-2">
						{infoPages.map((p: any) => (
							<li key={p.href}>
							<Link
								key={p.href}
								scroll={false}
								className="flex items-center gap-2 py-2 lg:px-8 lg:mx-0 text-base"
								href={p.href}
							>
								{p.label}
							</Link>
                            </li>
						))}
					</ul>
                    </div>
      

                </nav>
                </div>

               
        </div>
    )

}