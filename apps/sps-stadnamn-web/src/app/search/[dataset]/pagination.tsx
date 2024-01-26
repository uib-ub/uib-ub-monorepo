'use client'
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
 
export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const paginationUrl = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return pathname + "?" + params.toString()
    
  }
 
  return (
    <div className='flex grow'>
    
    {currentPage > 1 && <><button className='btn btn-primary btn-compact' onClick={() => { router.push(paginationUrl(currentPage - 1))}}><PiCaretLeft/></button>
                          <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(1))}}>1</button></>}
    {currentPage == totalPages && totalPages > 3 && <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(totalPages-2))}}>{totalPages-2}</button>}
    {currentPage > totalPages-2 && totalPages > 2 && <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(totalPages-1))}}>{totalPages-1}</button>}
    <span className='px-3 py-1 border border-slate-400'>{currentPage}</span>
    {currentPage == 1 && <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(2))}}>2</button>}
    {currentPage == 1 && totalPages > 2 && <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(3))}}>3</button>}
    {currentPage < totalPages-1 && <button className='btn btn-compact' onClick={() => { router.push(paginationUrl(totalPages))}}>{totalPages}</button>}
    {currentPage < totalPages && <button className='btn btn-primary btn-compact' onClick={() => { router.push(paginationUrl(currentPage + 1))}}><PiCaretRight/></button>}
    </div>
  )
}