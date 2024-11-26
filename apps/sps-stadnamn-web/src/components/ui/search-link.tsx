'use client'
import Link from "next/link";
import { createSerializer, parseAsString } from "nuqs";


export default function SearchLink({children, dataset, params, ...props}: {dataset: string, params: Record<string, string | null>, children: React.ReactNode, [key: string]: any}) {
    const serialize = createSerializer({
        dataset: parseAsString,
        ...Object.fromEntries(Object.keys(params).map(key => [key, parseAsString]))
    })

    
    return (
        <Link 
            href={serialize({
                ...(dataset !== 'search' && { dataset }),
                ...params
            })} 
            {...props}
        >
            {children}
        </Link>
    )
}
