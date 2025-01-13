'use client'
import { PiCaretDoubleLeft, PiCaretDoubleRight, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { parseAsInteger, useQueryState } from 'nuqs';
import { SearchContext } from '@/app/search-provider';
import { useContext } from 'react';

export default function Pagination({ totalPages }: { totalPages: number}) {
  const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const { totalHits } = useContext(SearchContext)

 return  (
  <div className='flex gap-8 flex-col md:flex-wrap md:flex-row content-center'>
  <div className='flex gap-2 justify-even'>
  
  {totalPages > 2 && <IconButton disabled={page == 1} onClick={() =>setPage(1)} label="Første side" className='btn btn-outline btn-compact grow md:grow-0' ><PiCaretDoubleLeft/></IconButton>
  
}
  { <IconButton disabled={page == 1} onClick={() => setPage(page - 1)} label="Forrige side" className='btn btn-outline btn-compact grow md:grow-0'><PiCaretLeft/></IconButton>

  }

  { page > 1 ? <span role="status" aria-live="polite" className='px-3 py-1 rounded-sm border-neutral-400'>{(page -1) * perPage + 1}-{page * perPage} av {totalHits?.value}{totalHits?.relation != 'eq' ? '+' : ''}</span>
   : <span className='px-3 py-1 rounded-sm border-neutral-400'>{(page -1) * perPage + 1}-{page * perPage} av {totalHits?.value}{totalHits?.relation != 'eq' ? '+' : ''}</span>}
  
    
  { 
    <IconButton disabled={page == totalPages} onClick={() =>setPage(page + 1)} label="Neste side" className='btn btn-outline btn-compact grow md:grow-0'><PiCaretRight/></IconButton>
  }
  { totalPages > 2 &&
    <IconButton disabled={page == totalPages} onClick={() => setPage(totalPages)} label="Siste side" className='btn btn-outline btn-compact grow md:grow-0'><PiCaretDoubleRight/></IconButton>
  }
  
  </div>
  <div className="self-center">
  <label htmlFor="per_page_select">Treff per side: </label>
  <select id="per_page_select" name="size" value={perPage} onChange={
      (event) => {
          setPage(1)
          setPerPage(parseInt(event.target.value))
          
      }
  }>
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
  