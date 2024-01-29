'use client'
import Link from "next/link";
import { useState } from "react";
import { PiList } from 'react-icons/pi';

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="md:absolute md:right-3">
            <button className="p-1 xl:hidden rounded-sm" onClick={() => setMenuOpen(!menuOpen)}><PiList className="text-3xl"/></button>
            <nav id="top " className={`flex gap-6 text-xl mx-6 hidden align-text-middle xl:flex`}>
                <Link href="/om">Om</Link>
                <Link href="/hjelp">Hjelp</Link>
            </nav>
        </div>
    )

}