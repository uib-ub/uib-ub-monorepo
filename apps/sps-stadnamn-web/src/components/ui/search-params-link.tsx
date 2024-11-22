'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SearchParamsLink({ href, children, withoutParams, addParams, ...rest }: { href?: string, withoutParams?: string[], addParams?: Record<string,string>, children: React.ReactNode, [x: string]: any }) {
    const searchParams = useSearchParams()
    const newParams = new URLSearchParams(searchParams)
    if (withoutParams) {
        withoutParams.forEach(param => newParams.delete(param))
    }
    if (addParams) {
        Object.entries(addParams).forEach(([key, value]) => newParams.set(key, value))
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