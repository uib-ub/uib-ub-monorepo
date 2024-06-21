'use client'
import Link from "next/link";
export default function NavBar({ handleBlur, ...props }: any) {
    return (
        <nav id="top " {...props}>
            <Link onBlur={handleBlur} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/a11y">Tilgjengelighet</Link>
            <Link onBlur={handleBlur} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/help">Søkeveiledning</Link>
            <Link onBlur={handleBlur} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/datasets">Søkevisninger</Link>
            <Link onBlur={handleBlur} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/feedback">Tilbakemelding</Link>
            <Link onBlur={handleBlur} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/info">Info</Link>

        </nav>
    )

}