'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { verifyAccess } from "./presentasjon/actions"
import { usePresentationPage } from "./presentasjon/hooks/usePresentationPage"
import { PiPresentation } from "react-icons/pi"

export default function NavBar({ handleBlur, ...props }: any) {
    const [hasPresentationAccess, setHasPresentationAccess] = useState(false)
    const { currentPage, goToLastPresentationPage } = usePresentationPage()

    useEffect(() => {
        const checkAccess = async () => {
            const hasAccess = await verifyAccess('historiedagar2025')
            setHasPresentationAccess(hasAccess)
        }
        checkAccess()
    }, [])

    return (
        <nav id="top" {...props}>
            {hasPresentationAccess && (
                <button 
                    onBlur={handleBlur} 
                    onClick={goToLastPresentationPage}
                    className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" 
                    title="Til presentasjon"
                >
                    <PiPresentation className="w-6 h-6" aria-hidden="true"/>
                </button>
            )}
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0 xl:hidden" href="/">Til forsiden</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/help">Søketips</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0 override-external-icon" href="https://skjemaker.app.uib.no/view.php?id=16665712">Tilbakemelding</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/info">Info</Link>
        </nav>
    )
}