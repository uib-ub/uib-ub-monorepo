'use client'
import { useState } from "react";
import { PiList } from 'react-icons/pi';
import NavBar from "./NavBar";

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            <div className=""><button aria-controls="menu_navbar" 
                                      aria-expanded={menuOpen} 
                                      className="p-1 rounded-sm lg:hidden ml-auto" 
                                      onClick={() => setMenuOpen(!menuOpen)}>
                                        <PiList className="text-3xl"/></button></div>
            {menuOpen && <NavBar id="menu_navbar" className="text-xl lg:hidden text-center gap-6 my-6 small-caps w-100 flex flex-col w-full font-semibold"/>}
        </>
    )

}