'use client'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ParamProps } from "./param-types"

function normalizeSearchParams(params: URLSearchParams) {
    const entries = Array.from(params.entries()).sort(
        ([aKey, aVal], [bKey, bVal]) => {
            const keyCompare = aKey.localeCompare(bKey, 'nb')
            if (keyCompare !== 0) {
                return keyCompare
            }
            return String(aVal).localeCompare(String(bVal), 'nb')
        }
    )

    const normalized = new URLSearchParams()
    for (const [key, value] of entries) {
        normalized.append(key, value)
    }
    return normalized
}

export default function Clickable({ children, remove, add, only, link, href, replace, notClickable, ...rest }: ParamProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    if (notClickable) {
        return <div {...rest}>{children}</div>
    }

    const newParams = new URLSearchParams(only ? undefined : searchParams)
    if (only) {
        Object.entries(only).forEach(([key, value]) => {
            if (value != null && value !== '') {
                newParams.set(key, value.toString())
            }
        }
        )
    }
    if (remove) {
        remove.forEach(param => newParams.delete(param))
    }
    if (add) {
        Object.entries(add).forEach(([key, value]) => {
            if (value == null) {
                newParams.delete(key)
            }
            else if (value !== '') {
                newParams.set(key, value.toString())
            }
        })
    }

    const stringParams = normalizeSearchParams(newParams).toString()

    if (link) {
        return <Link replace={replace} href={`${href ? href : ''}${stringParams ? `?${stringParams}` : ''}`} {...rest}>{children}</Link>
    }
    else {
        const handleClick = (event: React.MouseEvent) => {
            if (rest.onClick) {
                rest.onClick(event)
            }
            if (replace) {
                router.replace("?" + stringParams)
            }
            else {
                router.push("?" + stringParams)
            }
        }
        return <button type="button" {...rest} onClick={handleClick} >{children}</button>
    }
}