'use client'
import Link from "next/link";
export default function NavBar({ handleBlur, ...props }: any) {
    return (
        <nav id="top " {...props}>
            <Link onBlur={handleBlur} href="/a11y">Tilgjengelighet</Link>
            <Link onBlur={handleBlur} href="/help">Søkeveiledning</Link>
            <Link onBlur={handleBlur} href="/datasets">Søkevisninger</Link>
            <Link onBlur={handleBlur} href="/feedback">Tilbakemelding</Link>
            <Link onBlur={handleBlur} href="/info">Info</Link>

        </nav>
    )

}