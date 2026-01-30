'use client'
import Clickable from "@/components/ui/clickable/clickable";
import { useMode } from "@/lib/param-hooks";
import { useTreeIsolation } from "@/lib/tree-isolation";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef } from "react";
import { PiArchive, PiChatCircleText, PiHouseFill, PiInfo, PiList, PiMapTrifoldFill, PiMapTrifoldLight, PiPersonArmsSpread, PiQuestion, PiTableFill, PiTableLight, PiTreeViewFill, PiTreeViewLight, PiX } from 'react-icons/pi';
import { GlobalContext } from "../state/providers/global-provider";
import { useSessionStore } from "../state/zustand/session-store";

export default function Menu({ shadow, autocompleteShowing }: { shadow?: boolean, autocompleteShowing?: boolean }) {
    const menuOpen = useSessionStore((s) => s.menuOpen)
    const setMenuOpen = useSessionStore((s) => s.setMenuOpen)
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { currentUrl, isMobile } = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')
    const mode = useMode()
    const modeOutsideSearch = pathname == '/search' ? mode : null
    const { openTree, closeTree } = useTreeIsolation()
    const tree = searchParams.get('tree')
    const isTreeActive = pathname === '/search' && !!tree
    const isMapActive = modeOutsideSearch === 'map' && !isTreeActive
    const isTableActive = modeOutsideSearch === 'table' && !isTreeActive
    const router = useRouter()
    const q = searchParams.get("q")
    const datasetTag = searchParams.get("datasetTag")
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (menuRef.current && menuOpen && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [menuOpen, setMenuOpen]);





    useEffect(() => {
        setMenuOpen(false);
    }, [q, pathname, setMenuOpen]);





    return (
        <div ref={menuRef} className={`flex items-center justify-center h-full`} style={{ zIndex: menuOpen ? 10000 : 10000 }}>
            <button id="menu-button" aria-controls="menu_navbar"
                aria-label="Meny"
                aria-expanded={menuOpen}
                className={`items-center justify-center flex aspect-square bg-neutral-50 z-[6000] ${menuOpen ? 'fixed top-0 left-0 w-14 h-14' : `h-full w-full ${!isMobile && (autocompleteShowing ? 'rounded-tl-md' : 'rounded-l-md')}`}${(shadow && !menuOpen) ? ' shadow-lg border-r border-neutral-200' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <PiX className="text-3xl xl:text-2xl" aria-hidden="true" /> : <PiList className="text-3xl xl:text-2xl" aria-hidden="true" />}</button>

            <div
                id="menu_navbar"
                className={`bg-neutral-50 w-[calc(100svw-5rem)] xl:w-[calc(25svw-0.5rem)] xl:rounded-r-md shadow-lg overscroll-none h-[100svh] overflow-y-auto fixed top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <nav id="top" className="text-xl pb-6 flex flex-col">
                    <div className="flex items-center ml-14 h-14 px-2 ml-auto">
                        <Link href="/" className="text-xl no-underline flex items-center gap-3 w-full ml-auto">stadnamn.no<PiHouseFill className="text-neutral-800 mr-3" aria-hidden="true" /> </Link>

                    </div>

                    <div className="flex flex-col w-full gap-0">
                        <div className="flex flex-col w-full gap-0">
                            <Clickable
                                link
                                href="/search"
                                onClick={() => setMenuOpen(false)}
                                aria-current={isMapActive ? 'page' : undefined}
                                remove={['mode', 'tree', 'activePoint']}
                                add={{ maxResults: '1', point: searchParams.get('activePoint') }}
                                className={`w-full flex items-center gap-2 px-4 py-3 transition-colors no-underline cursor-pointer text-xl text-left
                                ${isMapActive
                                        ? 'bg-accent-800 text-white font-semibold'
                                        : 'hover:bg-accent-100 text-neutral-900'
                                    }`}
                            >
                                {isMapActive
                                    ? <PiMapTrifoldFill className="text-xl" aria-hidden="true" />
                                    : <PiMapTrifoldLight className="text-xl" aria-hidden="true" />}
                                Stadnamnkart
                            </Clickable>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false)
                                    tree ? closeTree() : openTree('root')
                                }}
                                aria-current={isTreeActive ? 'page' : undefined}
                                className={`w-full flex items-center gap-2 px-4 py-3 transition-colors no-underline cursor-pointer text-xl text-left
                                ${isTreeActive
                                        ? 'bg-accent-800 text-white font-semibold'
                                        : 'hover:bg-accent-100 text-neutral-900'
                                    }`}
                            >
                                {isTreeActive
                                    ? <PiTreeViewFill className="text-xl" aria-hidden="true" />
                                    : <PiTreeViewLight className="text-xl" aria-hidden="true" />}
                                Matrikkelvising
                            </button>
                            <Clickable
                                href="/search"
                                link
                                onClick={() => setMenuOpen(false)}
                                aria-current={isTableActive ? 'page' : undefined}
                                add={{ mode: 'table' }}
                                className={`w-full flex items-center gap-2 px-4 py-3 transition-colors no-underline cursor-pointer text-xl text-left
                                ${isTableActive
                                        ? 'bg-accent-800 text-white font-semibold'
                                        : 'hover:bg-accent-100 text-neutral-900'
                                    }`}
                            >
                                {isTableActive
                                    ? <PiTableFill className="text-xl" aria-hidden="true" />
                                    : <PiTableLight className="text-xl" aria-hidden="true" />}
                                Tabellvisning
                            </Clickable>
                        </div>
                        <hr className="w-full h-px bg-neutral-200 border-0 my-0" />
                        <div className="flex flex-col gap-0 w-full pb-0">
                            <Link scroll={false}
                                className={`flex items-center gap-2 px-4 py-3 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900 ${pathname === '/help' ? 'bg-accent-800 text-white font-semibold' : ''}`}
                                href="/help"
                                aria-current={pathname === '/help' ? 'page' : undefined}
                            >
                                <PiQuestion className="text-xl" aria-hidden="true" />Søketips
                            </Link>
                            <Link scroll={false}
                                className="flex items-center gap-2 px-4 py-3 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900"
                                href="https://skjemaker.app.uib.no/view.php?id=16665712"
                            >
                                <PiChatCircleText className="text-xl" aria-hidden="true" />Tilbakemelding
                            </Link>
                            <Link scroll={false}
                                className={`flex items-center gap-2 px-4 py-3 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900 ${pathname === '/iiif' ? 'bg-accent-800 text-white font-semibold' : ''}`}
                                href="/iiif"
                                aria-current={pathname === '/iiif' ? 'page' : undefined}
                            >
                                <PiArchive className="text-xl" aria-hidden="true" />Arkiv
                            </Link>
                            <div className="flex flex-col w-full">
                                <Link scroll={false}
                                    className={`flex items-center gap-2 px-4 py-3 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900 ${pathname === '/info' ? 'bg-accent-800 text-white font-semibold' : ''}`}
                                    href="/info"
                                    aria-current={pathname === '/info' ? 'page' : undefined}
                                >
                                    <PiInfo className="text-xl" aria-hidden="true" />Informasjon
                                </Link>
                                <Link scroll={false}
                                    className={`flex items-center gap-2 px-4 py-3 pl-10 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900 ${pathname === '/info/privacy' ? 'bg-accent-800 text-white font-semibold' : ''}`}
                                    href="/info/privacy"
                                    aria-current={pathname === '/info/privacy' ? 'page' : undefined}
                                >
                                    Personvern
                                </Link>
                                <Link scroll={false}
                                    className={`flex items-center gap-2 px-4 py-3 pl-10 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900 ${pathname === '/info/license' ? 'bg-accent-800 text-white font-semibold' : ''}`}
                                    href="/info/license"
                                    aria-current={pathname === '/info/license' ? 'page' : undefined}
                                >
                                    Opphavsrett
                                </Link>
                            </div>
                            <Link
                                scroll={false}
                                className="flex items-center gap-2 px-4 py-3 w-full transition-colors no-underline hover:bg-accent-100 text-neutral-900"
                                href="https://uustatus.no/nn/erklaringer/publisert/075fa5bb-f135-4383-a4e2-0d60482e2042"
                            >
                                <PiPersonArmsSpread className="text-xl" aria-hidden="true" />Tilgjengelegheitserklæring
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>



        </div>
    )

}