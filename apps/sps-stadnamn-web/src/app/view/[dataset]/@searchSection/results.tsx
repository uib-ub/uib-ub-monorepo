import Pagination from '../../../../components/results/pagination'
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiSortAscending, PiSortDescending, PiArticleFill, PiLinkBold, PiCaretUpFill, PiCaretDownFill } from 'react-icons/pi';
import { useState } from 'react';
import AudioButton from '../../../../components/results/audioButton';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/client-config-renderers';


export default function Results({ hits }: { hits: any }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()
    const [isOpen, setIsOpen] = useState(false)
    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details

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


  return (
    <section className='flex flex-col gap-2 py-2' aria-labelledby='result_heading'>
    <span className="flex px-2 gap-2 flex-wrap">
      <h2 id="result_heading" aria-live="polite" className='text-lg small-caps font-semibold'>
        <button type="button" className="flex gap-2 items-center flex-nowrap" onClick={() => setIsOpen(!isOpen)} aria-controls="result_list" aria-expanded={isOpen}>
          { isOpen? 
            <PiCaretUpFill aria-hidden={true} className="md:hidden"/>
            :
            <PiCaretDownFill aria-hidden={true} className="md:hidden"/> }
        Treff <span className='text-sm bg-neutral-100 rounded-full px-2'>{ (hits.total.value || '0')  + (hits.total.value == 10000 ? "+" : '')}</span>

        </button>
      </h2>
      <span className="ml-auto">
      <label>Sorter etter: </label>
      <select name="orderBy">
        <option value="">relevans</option>
        <option value="label">stadnamn</option>
        <option value="adm2">kommune</option>
      </select>
      { searchParams.get('orderBy') ?
      <IconButton className="ml-auto text-xl" label={searchParams.get('sort') == 'desc'? 'Sorter synkende' : 'Sorter stigende'} onClick={sortResults}>{searchParams.get('sort') == 'desc'? <PiSortDescending/> : <PiSortAscending/> }</IconButton>
      : null
      }
    </span>
    </span>
    <section id="result_list" className={`lg:py-1 ml-1 ${isOpen ? 'block' : 'hidden md:block'}`}>

    <ul className='flex flex-col gap-1 mb-2'>
      {hits.hits.map((hit: any) => (
        <li key={hit._id} className="my-0 py-2 px-2 flex flex-grow border-t last:border-b border-neutral-400">
        <div className='font-semibold">'>{titleRenderer(hit._source)}
        <p>
          { detailsRenderer(hit._source) }
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