'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const paginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return pathname + "?" + params.toString()
  }

  const perPageUrl = (size: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('size', String(size))
    return pathname + "?" + params.toString()
  }
 
  return (
    <>
    <div className='flex grow gap-2 mb-2'>
    {currentPage > 1 && <><IconButton label="Forrige side" className='btn btn-primary btn-compact' textIcon href={paginationUrl(currentPage - 1)}><PiCaretLeft/></IconButton>
                        {(totalPages != 3 || currentPage == 3) &&  <IconButton label="Første side" className='btn btn-compact' textIcon href={paginationUrl(1)}>1</IconButton> } </>}
    {currentPage == totalPages && totalPages > 3 && 
      <IconButton label={"Side " + (totalPages-2)} className='btn btn-compact' textIcon href={paginationUrl(totalPages-2)}>{totalPages-2}</IconButton>
    }
    {currentPage > totalPages-2 && totalPages > 2 && 
      <IconButton label={"Side " + (totalPages-1)} className='btn btn-compact' textIcon href={paginationUrl(totalPages-1)}>{totalPages-1}</IconButton>
    }
    <span className='px-3 py-1 border-2 rounded-sm border-neutral-400'>{currentPage}</span>
    {currentPage == 1 && 
      <IconButton label={"Side 2"} className='btn btn-compact' textIcon href={paginationUrl(2)}>2</IconButton>

    }
    {currentPage == 1 && totalPages > 3 && 
      <IconButton label={"Side 3"} className='btn btn-compact' textIcon href={paginationUrl(3)}>3</IconButton>
      }
    {((currentPage < totalPages-1) || (totalPages == 3 && currentPage < 3)) && 
      <IconButton label={"Side " + totalPages} className='btn btn-compact' textIcon href={paginationUrl(totalPages)}>{totalPages}</IconButton>
      }
    
    {currentPage < totalPages && 
      <IconButton label="Neste side" className='btn btn-primary btn-compact' textIcon href={paginationUrl(currentPage + 1)}><PiCaretRight/></IconButton>
    }
    </div>
    <div className='mb-2'>
    <label htmlFor="per_page_select">Treff per side: </label>
    <select id="per_page_select" name="size" onChange={
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
</div>
</>
    
  )
}