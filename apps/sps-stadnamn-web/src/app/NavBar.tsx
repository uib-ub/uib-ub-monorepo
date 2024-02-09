'use client'
import Link from "next/link";
export default function NavBar(props: any) {
    return (
        <nav id="top " {...props}>
            <Link href="/om">Tilgjengelighet</Link>
            <Link href="/om">Tilbakemelding</Link>
            <Link href="/om">Info</Link>

        </nav>
    )

}