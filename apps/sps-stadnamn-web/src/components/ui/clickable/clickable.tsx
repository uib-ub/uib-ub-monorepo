'use client'
import Link from "next/link"
import { useSearchParams, useRouter} from "next/navigation"
import { ParamProps } from "./param-types"


export default function Clickable({ children, remove, add, only, link, href, ...rest }: ParamProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const newParams = new URLSearchParams(only ? undefined : searchParams)
    if (only) {
        Object.entries(only).forEach(([key, value]) => {
            if (value != null && value !== '') {
                newParams.set(key, value)
            }
        }
        )
    }
    if (remove) {
        remove.forEach(param => newParams.delete(param))
    }
    if (add) {
        Object.entries(add).forEach(([key, value]) => {
            if (value != null && value !== '') {
                newParams.set(key, value)
            }
        })
    }

    const stringParams = newParams.toString()

    if (link) {
        return <Link href={`${href ? href : ''}${stringParams ? `?${stringParams}` : ''}`} {...rest}>{children}</Link>
    }
    else {
        return <button onClick={() => router.push("?" + stringParams)} {...rest}>{children}</button>
    }
}