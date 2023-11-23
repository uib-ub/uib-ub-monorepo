"use client"
import { Badge } from '@/components/ui/badge';
import { MdWarningAmber } from 'react-icons/md';
import Link from 'next/link';
import { ArrowRightIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Linkify } from '@/components/linkify';

const formatMessage = (message: string): React.ReactNode => {
  if (message.startsWith('Closed')) {
    message = message.replace('Closed', '')
    const closedProps = message.match(/(\[)(.*?)(\])/g)?.[0].replace(/\[|\]/g, '').split(',').map((prop: string) => prop.split('/').pop())
    const ignoredProps = message.match(/(\[)(.*?)(\])/g)?.[1].replace(/\[|\]/g, '').split(',').map((prop: string) => prop.split('/').pop())
    const errorProps = message.split('] ')[1].split(' : ')[0]

    return (
      <div className='grid md:grid-cols-3 text-xs'>
        <div>
          <div className='text-lg font-bold'>Tillatte props:</div>
          <div className='flex flex-wrap gap-1'>
            {closedProps?.map((prop: any, i: number) => (
              <Badge key={i} variant={'default'} className='rounded-none'>{prop}</Badge>
            ))}
            {ignoredProps?.map((prop: any, i: number) => (
              <Badge key={i} variant={'secondary'} className='rounded-none'>{prop}</Badge>
            ))}
          </div>
        </div>
        <div className='text-red-700'>
          <div className='text-lg font-bold'>Ulovlig prop:</div>
          {errorProps.split(' = ').pop()}
        </div>
      </div>
    )
  }
  return <Linkify replacePattern={["data.ub", "marcus"]}>{message}</Linkify >
}

export const ShaclResultCard = ({ data }: { data: any }) => {
  const MessageComponent = formatMessage(data.resultMessage)

  return (
    <div className='font-mono rounded-sm border overflow-hidden w-full'>
      <div className='flex flex-wrap align-top overflow-hidden'>
        <Badge variant={'destructive'} className='rounded-none'><MdWarningAmber className='mr-1' /></Badge>
        {data.resultPath ? <Badge className='rounded-none'><ArrowRightIcon className='mr-1' /> {data.resultPath}</Badge> : null}
        {data.focusNode ?? data['sh:focusNode'] ? <Badge className='rounded-none'><ArrowRightIcon className='mr-1' /> {data.focusNode ?? data['sh:focusNode']}</Badge> : null}
      </div>

      <div className='text-sm sm:text-md px-3 py-1 mt-1'>
        {MessageComponent ? MessageComponent : null}
      </div>

      <div className="flex pt-4 w-full">
        {/* <Badge variant={'secondary'} className='rounded-none'><GrInspect className='mr-1 text-red-400' /> {data.sourceConstraintComponent}</Badge>
        <Badge variant={'secondary'} className='rounded-none'><GrInspect className='mr-1 text-red-400' /> {data.sourceShape}</Badge> */}

        <div className='flex gap-2 ml-auto'>
          <HoverCard>
            <HoverCardTrigger><Badge variant={'secondary'} className='rounded-none font-mono py-1.5 cursor-pointer font-normal'>Shacl report</Badge></HoverCardTrigger>
            <HoverCardContent className='overflow-hidden'>
              <pre className='text-xs overflow-scroll'>{JSON.stringify(data, null, 2)}</pre>
            </HoverCardContent>
          </HoverCard>

          {data.focusNode?.startsWith('http') && !data.value ? (
            <Badge variant={'secondary'} className='rounded-none font-light'>
              <Link href={`https://sparql.ub.uib.no/#/dataset/sparql/query?query=describe%20%3C${data.focusNode}%3E`} target='_blank' className='flex items-center gap-2'>
                Sparql query
                <ExternalLinkIcon />
              </Link>
            </Badge>
          ) : null}
          {data.focusNode?.startsWith('http') && !data.value ? (
            <Badge className='rounded-none'>
              <Link className='flex items-baseline gap-2' href={data.focusNode.replace('data.ub', 'marcus')} target='_blank'>Gå til Marcus <ExternalLinkIcon /></Link>
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}