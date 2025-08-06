'use client'
import { PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { SearchContext } from '@/app/search-provider';
import { useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClickableIcon from '../ui/clickable/clickable-icon';

export default function Pagination({ totalPages }: { totalPages: number}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get current values from URL or use defaults
  const perPage = Number(searchParams.get('perPage')) || 10
  const page = Number(searchParams.get('page')) || 1
  const { totalHits } = useContext(SearchContext)

  const setPerPage = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('perPage', newPerPage.toString())
    params.set('page', '1') // Reset to first page when changing items per page
    router.push(`?${params.toString()}`)
  }

  return  (
    <div className='flex gap-8 flex-col md:flex-wrap md:flex-row content-center'>
      <div className='flex gap-2 justify-between items-center'>
        
        {totalPages > 2 && <ClickableIcon 
          disabled={page == 1} 
          add={{page: '1'}}
          label="Første side" 
          className='btn btn-outline btn-compact grow md:grow-0 aspect-square'>
            <PiCaretDoubleLeft/>
        </ClickableIcon>}
        
        <ClickableIcon 
          disabled={page == 1} 
          add={{page: (page - 1).toString()}}
          label="Forrige side" 
          className='btn btn-outline btn-compact grow md:grow-0 aspect-square'>
            <PiCaretLeft/>
        </ClickableIcon>

        <span role="status" aria-live="polite" className='px-3 py-1 rounded-sm border-neutral-400 flex text-center'>
          {(page -1) * perPage + 1}-{page * perPage} av {totalHits?.value?.toLocaleString('no-NO')}{totalHits?.relation != 'eq' ? '+' : ''}
        </span>
        
        <ClickableIcon 
          disabled={page == totalPages} 
          add={{page: (page + 1).toString()}}
          label="Neste side" 
          className='btn btn-outline btn-compact grow md:grow-0 aspect-square'>
            <PiCaretRight/>
        </ClickableIcon>

        {totalPages > 2 && <ClickableIcon 
          disabled={page == totalPages} 
          add={{page: totalPages.toString()}}
          label="Siste side" 
          className='btn btn-outline btn-compact grow md:grow-0 aspect-square'>
            <PiCaretDoubleRight/>
        </ClickableIcon>}
      </div>

      <div className="self-center">
        <label htmlFor="per_page_select">Treff per side: </label>
        <select 
          id="per_page_select" 
          name="size" 
          value={perPage} 
          onChange={(event) => setPerPage(parseInt(event.target.value))}>
          {[10, 20, 50, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
  