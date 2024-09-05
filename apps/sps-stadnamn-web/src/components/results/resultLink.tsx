
'use client'
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function ResultLink({children, doc, dataset}: {doc: any, dataset?: string, children: React.ReactNode}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const params = useParams()

    const newSearchParams = new URLSearchParams(searchParams)
    if (newSearchParams.get('search') == 'show') {
      newSearchParams.set('search', 'hide')
    }
    const uuid = doc._source?.children?.length == 1 ? doc._source?.children[0] : doc._source?.uuid || doc.fields?.uuid
    const docUrl =  `/view/${dataset || params.dataset }/doc/${uuid}?${newSearchParams.toString()}`
    


    return (

      <Link href={docUrl}
            className="no-underline text-semibold hover:underline !text-black aria-[current=page]:underline  aria-[current=page]:!text-accent-800  aria-[current=page]:!decoration-accent-800"
            aria-current={pathname.includes('/doc/') && (params.uuid == doc._source?.uuid || (doc._source?.children?.length == 1 && doc._source?.children[0] == params.uuid)) ? 'page': undefined}>
            {children}
        </Link>
    )

}