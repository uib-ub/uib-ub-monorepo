"use client"
import { copyTextToClipboard } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MdWarningAmber } from 'react-icons/md';
import Link from 'next/link';
import { ArrowRightIcon, CopyIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { GrInspect } from 'react-icons/gr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formatMessage = (message: string) => {
  if (message.startsWith('Closed')) {
    /* message = message.replace('Closed', '')
    const closedProps = message.split(']')[0]
    const errorProps = message.split(']')[1].split(' : ')[0]
    const closedObject = message.split(']')[1].split(' : ')[1]

    return [closedProps + ']', errorProps, closedObject] */
    return ['Har properties som ikke er definert i skjemaet.']
  }
  return [message]
}

export const ShaclResultCard = ({ data }: { data: any }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (input: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(input)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className='font-mono rounded-sm border overflow-hidden w-full'>
      <div className='flex align-top overflow-hidden'>
        <Badge className='md:text-lg rounded-none rounded-br-sm'><ArrowRightIcon className='mr-1' /> {data.resultPath}</Badge>
        <Badge variant={'destructive'} className='md:text-lg rounded-none rounded-bl-sm ml-auto'><MdWarningAmber className='mr-1' /> {data.resultSeverity}</Badge>
      </div>
      <div className='text-sm sm:text-lg px-3 py-1 mt-1'>
        {formatMessage(data.resultMessage).map((message: string, i: number) => (
          <p key={i}>{message}</p>
        ))}
      </div>
      <div className='px-3 py-1 flex items-baseline gap-2'>
        <h2 className='font-bold text-sm md:text-md'>
          <Link className='underline underline-offset-2 flex items-baseline gap-2' href={data.focusNode.replace('data.ub', "marcus")} target='_blank'>{data.focusNode.replace('data.ub', "marcus")} <ExternalLinkIcon /></Link>
        </h2>
        <Button size={'sm'} variant={'secondary'} onClick={handleCopyClick(data.focusNode.split('/').pop())}>
          <CopyIcon className='mr-1' /><span className='block'>{isCopied ? 'id kopiert!' : 'id'}</span>
        </Button>
      </div>
      <div className="flex pt-4 w-full">
        <Badge variant={'secondary'} className='rounded-none'><GrInspect className='mr-1 text-red-400' /> {data.sourceConstraintComponent}</Badge>
        <Badge variant={'secondary'} className='rounded-none ml-auto font-light'>
          <Link href={`https://sparql.ub.uib.no/#/dataset/sparql/query?query=describe%20%3C${data.focusNode}%3E`} target='_blank' className='flex items-center gap-2'>
            Sparql query
            <ExternalLinkIcon />
          </Link>
        </Badge>
      </div>
    </div>
  )
}