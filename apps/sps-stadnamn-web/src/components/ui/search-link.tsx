'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"



type OnlyParams = { only: Record<string, string | null>; add?: never; remove?: never };
type AddParams = { only?: never; add: Record<string, string | null>; remove?: string[] };
type RemoveParams = { only?: never; add?: Record<string, string | null>; remove: string[] };

type Props = (OnlyParams | AddParams | RemoveParams) & {
  href?: string;
  children: React.ReactNode;
  [x: string]: any;
};

export default function SearchLink({ href, children, remove, add, only, ...rest }: Props) {
    const searchParams = useSearchParams()
    const newParams = new URLSearchParams(only ? undefined : searchParams)
    if (only) {
        Object.entries(only).forEach(([key, value]) => {
            if (value != null) {
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
            if (value != null) {
                newParams.set(key, value)
            }
        })
    }

    // remove any params starting with _
    /*
    for (const key of newParams.keys()) {
        if (key.startsWith('_')) {
            newParams.delete(key)
        }
    }
    */

    return (
        <Link href={(href || '') + "?" + newParams.toString()} {...rest}>
            {children}
        </Link>
       
    )
}