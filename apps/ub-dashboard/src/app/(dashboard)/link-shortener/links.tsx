import React from 'react'

export const revalidate = 30;

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ES_INDEX, getEsClient } from '@/utils/es';
import { linkSchema, type Link } from '@/utils/link-schema';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

async function getData(): Promise<Link[]> {
  'use server'
  const client = getEsClient()
  const result = await client.search({
    index: ES_INDEX,
    size: 1000,
    sort: [{ created: 'desc' }],
  })

  return result.hits.hits
    .map((hit) => {
      const parsed = linkSchema.safeParse(hit._source)
      return parsed.success ? parsed.data : null
    })
    .filter((link): link is Link => link !== null)
}

const Links = async () => {
  const data = await getData();

  return (
    <div className='flex flex-col gap-4'>
      {data ? data.map((link) => (
        <div key={link.path} className='flex gap-4 border rounded-lg overflow-hidden'>
          <div className='px-5 py-4'>
            <div className='font-black text:md md:text-2xl break-all'>{link.title ?? link.originalURL}</div>
            <div className='flex flex-wrap align-baseline gap-2 text-sm'>
              <a className='break-all' href={`https://${link.domain}/${link.path}`}>
                {`https://${link.domain}/${link.path}`}
              </a>
              <span className='font-bold italic'>peker videre til</span>
              <a href={link.originalURL} target='_blank' rel='noreferrer' className='flex items-baseline break-all'>
                {link.originalURL} <ExternalLinkIcon className='' />
              </a>
            </div>
            <p>Besøk: {link.views ?? 0}</p>
          </div>

          <div className='ml-auto shrink-0'>
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
      )) : <p>Loading...</p>
      }
    </div>
  )
}

export default Links
