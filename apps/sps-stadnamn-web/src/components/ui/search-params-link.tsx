'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SearchParamsLink({ href, children, remove, add, only, ...rest }: { href?: string, remove?: string[], add?: Record<string,string | null>, only?: Record<string, string>, children: React.ReactNode, [x: string]: any }) {
    const searchParams = useSearchParams()
    const newParams = new URLSearchParams(searchParams)
    if (remove) {
        remove.forEach(param => newParams.delete(param))
    }
    if (add) {
        Object.entries(add).forEach(([key, value]) => {
            if (value != null) {
                newParams.set(key, value)
            }
        })
    }
    // remove any params starting with _
    for (const key of newParams.keys()) {
        if (key.startsWith('_')) {
            newParams.delete(key)
        }
    }

    return (
        <Link href={(href || '') + "?" + newParams.toString()} {...rest}>
            {children}
        </Link>
       
    )
}