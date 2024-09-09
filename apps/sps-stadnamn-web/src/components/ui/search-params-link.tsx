'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function SearchParamsLink({ href, children }: { href: string, children: React.ReactNode }) {
    const searchParams = useSearchParams()
    return (
        <Suspense fallback={<Link href={href}>{children}</Link>}>
            <Link href={href + "?" + searchParams.toString()}>
                {children}
            </Link>
        </Suspense>
    )
}