'use client'
import { useState, useRef, useEffect } from "react";
import { PiList } from 'react-icons/pi';
import NavBar from "./NavBar";
import IconButton from "@/components/ui/icon-button";
import { usePathname, useSearchParams } from "next/navigation";

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null);
    const pathName = usePathname();
    const searchParams = useSearchParams();

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
        <div ref={menuRef} className="lg:hidden ml-auto">
            <IconButton aria-controls="menu_navbar" 
                        onBlur={handleBlur}
                        label="Meny"
                        aria-expanded={menuOpen} 
                        className="p-1 px-2 rounded-sm" 
                        onClick={() => setMenuOpen(!menuOpen)}>
                <PiList className="text-3xl"/></IconButton>
            {menuOpen && 
                <div 
                     id="menu_navbar" 
                     className="absolute !z-[3000] !top-[100%] left-0 w-full">
                <NavBar 
                        onBlur={handleBlur}
                        className=" h-fit bg-neutral-50 lg:hidden text-xl text-center py-6 small-caps flex flex-col w-full h-full font-semibold border-b-2 border-neutral-500 shadow-md"/>
                </div>
               }
        </div>
    )

}