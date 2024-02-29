'use client'
import Link from "next/link";
export default function NavBar(props: any) {
    return (
        <nav id="top " {...props}>
            <Link href="/a11y">Tilgjengelighet</Link>
            <Link href="/datasets">Kilder</Link>
            <Link href="/feedback">Tilbakemelding</Link>
            <Link href="/om">Info</Link>

        </nav>
    )

}