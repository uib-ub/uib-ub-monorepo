'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

export default function Pagination({ totalPages, currentPage = 1, setCurrentPage}: { totalPages: number, currentPage?: number, setCurrentPage?: (page: number) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isClient = setCurrentPage !== undefined
  currentPage = isClient ? currentPage : Number(searchParams.get('page')) || 1;
  
  

  const paginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return pathname + "?" + params.toString()
  }

  const perPageUrl = (size: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('size', String(size))
    if (params.has('page')) {
      params.set('page', '1')
    }
    return pathname + "?" + params.toString()
  }

  const firstAction = isClient ? {onClick: () => setCurrentPage(1)} : {href: paginationUrl(1)}
  const lastAction = isClient ? {onClick: () => setCurrentPage(totalPages)} : {href: paginationUrl(totalPages)}
  const nextAction = isClient ? {onClick: () => setCurrentPage(currentPage + 1)} : {href: paginationUrl(currentPage + 1)}
  const prevAction = isClient ? {onClick: () => setCurrentPage(currentPage - 1)} : {href: paginationUrl(currentPage - 1)}


 return  (
  <div className='flex gap-8 flex-col md:flex-wrap md:flex-row content-center'>
  
  <div className='flex gap-2 justify-even'>
  
  {totalPages > 2 && <IconButton disabled={currentPage == 1} label="Første side" className='btn btn-outline btn-compact grow md:grow-0' textIcon {...firstAction}><PiCaretDoubleLeft/></IconButton>
  
}
  { <IconButton disabled={currentPage == 1} label="Forrige side" className='btn btn-outline btn-compact grow md:grow-0' textIcon {...prevAction}><PiCaretLeft/></IconButton>
  
  }

  { currentPage > 1 ? <span role="status" aria-live="polite" className='px-3 py-1 rounded-sm border-neutral-400'>Side {currentPage} av {totalPages}</span>
   : <span className='px-3 py-1 rounded-sm border-neutral-400'>Side {currentPage} av {totalPages}</span>
  }
  

  

  
  { 
    <IconButton disabled={currentPage == totalPages} label="Neste side" className='btn btn-outline btn-compact grow md:grow-0' textIcon {...nextAction}><PiCaretRight/></IconButton>
  }
  { totalPages > 2 &&
    <IconButton disabled={currentPage == totalPages} label="Siste side" className='btn btn-outline btn-compact grow md:grow-0' textIcon {...lastAction}><PiCaretDoubleRight/></IconButton>
  }
  </div>
  {!isClient && <div className="self-center">
  <label htmlFor="per_page_select">Treff per side: </label>
  <select id="per_page_select" name="size" value={parseInt(searchParams.get('size') || '10')} onChange={
      (event) => {
          router.push(perPageUrl(event.target.value))
      }
  }>
{[10, 20, 50, 100].map((value) => (
  <option key={value} value={value}>
    {value}
  </option>
))}

</select>
</div>}
  
</div>
    
  )
  }
  