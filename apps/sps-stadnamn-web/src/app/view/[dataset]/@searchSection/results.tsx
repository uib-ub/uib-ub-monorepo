import Pagination from '../../../../components/results/pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending, PiArticleFill, PiLinkBold, PiCaretUp, PiCaretDown, PiListNumbers, PiArrowsDownUp } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import AudioButton from '../../../../components/results/audioButton';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/dataset-render-config';
import { sortConfig } from '@/config/dataset-config';
import Spinner from '@/components/svg/Spinner';


export default function Results({ hits, isLoading }: { hits: any, isLoading: boolean}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()
    const [isOpen, setIsOpen] = useState(false)
    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details
    const [ showLoading, setShowLoading ] = useState<boolean>(true)

    useEffect(() => {
      if (!isLoading) {
        setTimeout(() => {
          setShowLoading(false)
        }, 200);
      }
      else {
        setShowLoading(true)
      }
    }
    , [isLoading])


    const sortResults = () => {
      const params = new URLSearchParams(searchParams)
      if (searchParams.get('sort') == 'desc') {
        params.delete('sort')
      } else {
        params.set('sort', 'desc')
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }

    const orderBy = (e: any) => {
      const params = new URLSearchParams(searchParams)
      if (e.target.value == '') {
        params.delete('orderBy')
      } else {
        params.set('orderBy', e.target.value)
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }

    const showInMap = (uuid: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('docs', String(uuid))
      router.push(`/view/${params.dataset}?${newSearchParams.toString()}`)
    }

    const goToDoc = (uuid: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('docs')
      router.push(`/view/${params.dataset}/doc/${uuid}?${newSearchParams.toString()}`)
    }

    const goToIIIF = (uuid: string, manifest: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('docs', String(uuid))
      router.push(`/view/${params.dataset}/iiif/${manifest}?${newSearchParams.toString()}`)
    }

  const ResutlsTitle = () => {
    return <>
    <span className='text-xl text-center h-full font-semibold small-caps'>
      Treff
      </span> { showLoading ? <Spinner className='inline w-[1em] h-[1em}'/> : <span className='text-sm bg-neutral-100 rounded-full px-2'>{ (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</span> }
    </>
  }


  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-2 gap-2 flex-wrap">
      <h2 id="result_heading" aria-live="polite">
        <button type="button" className="flex gap-2 items-center flex-nowrap md:hidden" onClick={() => setIsOpen(!isOpen)} aria-controls="result_list" aria-expanded={isOpen}>
          { isOpen? 
            <PiCaretUp aria-hidden={true} className="md:hidden"/>
            :
            <PiCaretDown aria-hidden={true} className="md:hidden"/> }
        <ResutlsTitle/>

        </button>
        <span className='hidden md:inline'><ResutlsTitle/></span>

      </h2>
      <div className="ml-auto flex items-end gap-4">
      {sortConfig[params.dataset] && 
      <span>
        <label className="sr-only" htmlFor="sort_select">Sorter etter: </label>
        <select id="sort_select" form="searchForm" name="orderBy" onChange={orderBy}>
          <option value="" selected={searchParams.get('orderBy') == ''}>relevans</option>
          {sortConfig[params.dataset].map((sort: any) => (
            <option key={sort.key} value={sort.key} selected={searchParams.get('orderBy') == sort.key}>  {sort.label}</option>
          ))}
        </select>
      </span>
    }

      <IconButton label={searchParams.get('sort') == 'desc'? 'Sorter synkende' : 'Sorter stigende'} onClick={sortResults}>{searchParams.get('sort') == 'desc'? <PiSortDescending className='text-xl'/> : <PiSortAscending className=' text-xl'/> }</IconButton>

      
    </div>
    </span>
    <section id="result_list" className={`lg:py-1 ml-1 ${isOpen ? 'block' : 'hidden md:block'}`}>

    <ul className='flex flex-col gap-1 mb-2'>
      {hits.hits.map((hit: any) => (
        <li key={hit._id} className="my-0 py-2 px-2 flex flex-grow border-t last:border-b border-neutral-400">
        <div className='font-semibold">'>{titleRenderer(hit)}
        <p>
          { detailsRenderer(hit) }
        </p>
        </div>
        <div className='flex gap-1 ml-auto self-end'>

        {hit._source.image && 
          <IconButton 
            onClick={() => goToIIIF(hit._id, hit._source.image.manifest)} 
            label="Vis seddel" 
            aria-current={searchParams.get('docs') == hit._id && pathname.includes('/iiif/') ? 'page': undefined}
            className="p-1 text-neutral-700">
              <PiArticleFill className="text-xl xl:text-3xl"/></IconButton> 
        }
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${hit._source.audio.file}` } 
                       className="text-xl xl:text-3xl text-neutral-700"/> 
        }
        {hit._source.link &&
        <Link href={hit._source.link} className="no-underline" target="_blank">
          <IconButton 
            label="Ekstern ressurs"
            className="p-1 text-neutral-700 xl:text-xl">
               <PiLinkBold className="text-xl xl:text-3xl"/>
          </IconButton> 
        </Link>
        }
        {hit._source.location && 
          <IconButton 
            onClick={() => showInMap(hit._id)} 
            label="Vis i kart" 
            aria-current={searchParams.get('docs') == hit._id && pathname == `/view/${params.dataset}` ? 'page': undefined} 
            className="p-1 text-neutral-700">
              <PiMapPinFill className="text-xl xl:text-3xl"/></IconButton> 
        }
        <IconButton 
          onClick={() => goToDoc(hit._id)} 
          label="Infoside" 
          aria-current={params.uuid == hit._id && pathname.includes('/doc/') ? 'page': undefined} 
          className="p-1 text-primary-600">
            <PiInfoFill className="text-xl xl:text-3xl"/></IconButton>
        </div>
        </li>
      ))}
    </ul>


    <nav className="center gap-2">
      {hits.total.value > 10 && <Pagination totalPages={Math.ceil(hits.total.value / (Number(searchParams.get('size')) || 10))}/>}
    </nav>

    </section>
    </section>
    )
}