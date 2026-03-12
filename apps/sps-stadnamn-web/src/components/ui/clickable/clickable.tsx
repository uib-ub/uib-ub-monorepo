'use client'
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ParamProps } from "./param-types"
import { useSessionStore } from "@/state/zustand/session-store"

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
    const treeSavedQuery = useSessionStore((s) => s.treeSavedQuery)
    const setTreeSavedQuery = useSessionStore((s) => s.setTreeSavedQuery)

    if (notClickable) {
        return <div {...rest}>{children}</div>
    }

    const { className, ...restProps } = rest
    const clickableClassName = cn("cursor-pointer", className)

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

    const hasTreeNow = !!searchParams.get('tree')
    const nextTreeValue =
        (only && (only as any).tree != null && (only as any).tree !== '')
            ? (only as any).tree
            : (add && (add as any).tree != null && (add as any).tree !== '')
                ? (add as any).tree
                : null

    const willEnterTree = !hasTreeNow && !!nextTreeValue

    const saveTreeQueryIfNeeded = () => {
        if (!willEnterTree || treeSavedQuery) return
        if (typeof window === 'undefined') return
        const currentSearch = window.location.search || ''
        if (!currentSearch) return
        setTreeSavedQuery(currentSearch)
    }

    const stringParams = normalizeSearchParams(newParams).toString()

    if (link) {
        return (
            <Link
                replace={replace}
                href={`${href ? href : ''}${stringParams && (only || remove || add) ? `?${stringParams}` : ''}`}
                className={clickableClassName}
                onClick={(event) => {
                    if ((restProps as any).onClick) {
                        (restProps as any).onClick(event)
                    }
                    saveTreeQueryIfNeeded()
                }}
                {...restProps}
            >
                {children}
            </Link>
        )
    }
    else {
        const handleClick = (event: React.MouseEvent) => {
            if (restProps.onClick) {
                restProps.onClick(event)
            }
            saveTreeQueryIfNeeded()
            if (replace) {
                router.replace("?" + stringParams)
            }
            else {
                router.push("?" + stringParams, { scroll: false })
            }
        }
        return (
            <button
                type="button"
                className={clickableClassName}
                {...restProps}
                onClick={handleClick}
            >
                {children}
            </button>
        )
    }
}