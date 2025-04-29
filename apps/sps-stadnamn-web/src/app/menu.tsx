'use client'
import { useState, useRef, useEffect, useContext } from "react";
import { PiCaretLeft, PiList } from 'react-icons/pi';
import NavBar from "./nav-bar";
import { usePathname, useSearchParams } from "next/navigation";
import { GlobalContext } from "./global-provider";
import Link from "next/link";

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null);
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const { currentUrl } = useContext(GlobalContext)

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
    }, [pathName, searchParams]);



    return (
        <div ref={menuRef} className="xl:hidden !ml-auto flex gap-1 items-center">
            { pathName !== '/' && pathName != '/search' && currentUrl && 
                <Link href={currentUrl} aria-label="Tilbake til søket"><PiCaretLeft className="text-3xl"/></Link>
            }
            <button aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        aria-label="Meny"
                        aria-expanded={menuOpen} 
                        className="p-1 px-2 rounded-sm items-center flex h-full" 
                        onClick={() => setMenuOpen(!menuOpen)}>
                <PiList className="text-3xl"/></button>
            {menuOpen && 
                <div 
                     id="menu_navbar" 
                     className="absolute !z-[3000] !top-[100%] left-0 w-full">
                <NavBar 
                        onBlur={handleBlur}
                        className="bg-neutral-50 xl:hidden text-xl text-center py-6 small-caps flex flex-col w-full h-full font-semibold border-t-2 border-neutral-200 shadow-md"/>
                </div>
               }
        </div>
    )

}