'use client'
import { useState } from "react";
import { PiList } from 'react-icons/pi';
import NavBar from "./NavBar";
import IconButton from "@/components/ui/icon-button";

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            <IconButton aria-controls="menu_navbar" 
                                        label="Meny"
                                        aria-expanded={menuOpen} 
                                        className="p-1 px-2 rounded-sm lg:hidden ml-auto" 
                                        onClick={() => setMenuOpen(!menuOpen)}>
                                        <PiList className="text-3xl"/></IconButton>
            {menuOpen && <NavBar id="menu_navbar" className="text-xl lg:hidden text-center gap-6 my-6 small-caps w-100 flex flex-col w-full font-semibold"/>}
        </>
    )

}