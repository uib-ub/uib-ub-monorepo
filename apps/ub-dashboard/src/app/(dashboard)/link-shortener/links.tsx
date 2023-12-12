export const revalidate = 30;

import React from 'react';
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
            <div className='font-black text:md md:text-2xl break-all'>{link.title || link.originalURL}</div>
            <div className='flex flex-wrap align-baseline gap-2 text-sm'>
              <a className='break-all' href={`https://${link.domain}/${link.path}`}>
                {`https://${link.domain}/${link.path}`}
              </a>
              <span className='font-bold italic'>peker videre til</span>
              <a href={link.originalURL} target='_blank' rel='noreferrer' className='flex items-baseline break-all'>
                {link.originalURL} <ExternalLinkIcon className='' />
              </a>
            </div>
            <p>Besøk: {link.views}</p>
          </div>

          <div className='ml-auto flex-shrink-0'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image alt='' className='object-contain' width={120} height={120} src={`data:image/svg+xml;utf8,${encodeURIComponent(link.qr)}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Høyreklikk på QR-koden og lagre det som bilde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Links