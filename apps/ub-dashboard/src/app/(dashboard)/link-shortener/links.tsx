export const revalidate = 30;

import React from 'react';
import Image from 'next/image'
import { LinksRecord, XataClient } from '@/utils/xata';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

const xata = new XataClient();

async function getData() {
  return await xata.db.links.sort('created', 'desc').getAll()
}

const Links = async () => {
  const data: LinksRecord[] = await getData();

  return (
    <div className='flex flex-col gap-4'>
      {data && data.map((link: LinksRecord) => (
        <div key={link.id} className='flex gap-4 border rounded-lg overflow-hidden'>
          <div className='px-5 py-4'>
            <div className='font-black text-2xl'>{link.title || link.originalURL}</div>
            <div className='flex flex-wrap align-baseline gap-2 text-sm'>
              <a href={`https://${link.domain}/${link.path}`}>
                {`https://${link.domain}/${link.path}`}
              </a>
              <span className='font-bold italic'>redirects to</span>
              <a href={link.originalURL} target='_blank' rel='noreferrer' className='flex items-baseline'>
                {link.originalURL} <ExternalLinkIcon className='' />
              </a>
            </div>
            <p>Views: {link.views}</p>
          </div>

          <Image alt='' className='ml-auto object-contain' width={100} height={100} src={`data:image/svg+xml;utf8,${encodeURIComponent(link.qr)}`} />
        </div>
      ))}
    </div>
  )
}

export default Links