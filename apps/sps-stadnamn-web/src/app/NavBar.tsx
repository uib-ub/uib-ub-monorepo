'use client'
import Link from "next/link";
export default function NavBar(props: any) {
    return (
        <nav id="top " {...props}>
            <Link href="/a11y">Tilgjengelighet</Link>
            <Link href="/help">Søkeveiledning</Link>
            <Link href="/datasets">Søkevisninger</Link>
            <Link href="/feedback">Tilbakemelding</Link>
            <Link href="/info">Info</Link>

        </nav>
    )

}