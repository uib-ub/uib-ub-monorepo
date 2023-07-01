import React from 'react';
import Image from 'next/image';
import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, toBase64, shimmer, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, Popover, PopoverContent, PopoverTrigger } from 'ui-react';
import { Info, Link } from "lucide-react"

const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

export function Hit({ hit }) {
  return (
    <Card className='break-inside-avoid'>
      {
        hit.image ? (
          <div className='w-full rounded-t-lg'>
            <a href={`/items/${hit.identifier}`}>
              <Image
                src={hit.image}
                className='object-cover h-auto max-w-full bg-neutral-700 dark:bg-neutral-950 rounded-t-lg'
                alt=''
                width={400}
                height={400}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(400, 400))}`}
              />
            </a>
          </div>
        ) : null
      }
      <CardHeader className='p-2'>
        <CardTitle>
          <a href={`/items/${hit.identifier}`} className='leading-6'>
            {hit.label_none || hit.label?.no || hit.identifier}
          </a>
        </CardTitle>
        <CardDescription>
          {hit.maker?.map(m => (
            <div key={m.id} className='text-sm'>
              {m.label_none}
            </div>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className='p-2'>
        {hit.description_none ?? hit.description?.no ? (
          <div className='text-sm font-serif'>{renderHTML(hit.description_none ?? hit.description?.no)}</div>
        ) : null}
      </CardContent>
      <CardFooter className='flex flex-wrap gap-2 justify-between w-full text-sm p-2'>
        <Popover>
          <PopoverTrigger className='flex flex-nowrap items-center gap-1'>Info <Info className="h-4 w-4" /></PopoverTrigger>
          <PopoverContent>
            <div className='flex flex-wrap'>
              <Badge variant='outline' className='shrink-0'>{hit.identifier}</Badge>
              {Array.isArray(hit.type) ? hit.type.map(t => (
                <Badge key={t} variant='outline'>{t}</Badge>
              )) : [hit.type].map(t => (
                <Badge key={t} variant='outline'>{t}</Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger className='flex flex-nowrap items-center gap-1'>Links <Link className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Open in:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={hit.homepage} target="_blank" rel='noreferrer'>Marcus</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`https://projectmirador.org/embed/?manifest=${hit.subjectOfManifest}`} target="_blank" rel='noreferrer'>Mirador</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>

  )
}

