/* eslint-disable @next/next/no-html-link-for-pages */

import { MagicWandIcon } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function PreviewIndicator() {
  return (
    <Popover>
      <PopoverTrigger className="fixed bottom-8 left-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 p-3 font-mono text-xs text-white">
        <div>
          <MagicWandIcon className='w-3 h-3' />
        </div>
      </PopoverTrigger>
      <PopoverContent className='p-2 mb-1 ml-2'>
        <div className='content-center'>
          {'Previewing drafts. '}
          <br />
          <a
            className="underline transition hover:opacity-50"
            href="/api/disable-draft"
          >
            Back to published
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}