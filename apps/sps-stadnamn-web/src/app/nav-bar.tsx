'use client'
import Clickable from "@/components/ui/clickable/clickable"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export default function NavBar({ handleBlur, ...props }: any) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const tree = searchParams.get('tree')

    return (
        <nav id="top" {...props}>
            {pathname == "/search" && <Link onBlur={handleBlur} scroll={false} className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="/">Til forsiden</Link>}
            <Clickable onBlur={handleBlur} scroll={false} remove={['mode']} link href="/search" className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:pl-8 lg:mx-0">Kart</Clickable>
            <Clickable
                onBlur={handleBlur}
                add={{ tree: 'root' }}
                className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0"
            >
                Matrikkelvising
            </Clickable>
            <Clickable onBlur={handleBlur} scroll={false} add={{ mode: 'table' }} link href="/search" className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0">Tabell</Clickable>
            <Clickable onBlur={handleBlur} scroll={false} add={{ mode: 'list' }} link href="/search" className="py-3 lg:py-0 mb-4 justify-end lg:my-1 lg:px-4 lg:mx-0  xl:border-r-2 xl:border-primary-300">Liste</Clickable>
            <Link onBlur={handleBlur} scroll={false} className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="/iiif">Arkiv</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0" href="/help">Søketips</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:mx-0 override-external-icon" href="https://skjemaker.app.uib.no/view.php?id=16665712">Tilbakemelding</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 lg:py-0 lg:my-1 lg:px-4 lg:pr-8 lg:mx-0" href="/info">Info</Link>
        </nav>
    )
}