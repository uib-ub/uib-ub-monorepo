import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { PiMapPinFill, PiInfoFill, PiArticleFill, PiLinkBold } from 'react-icons/pi';
import AudioButton from '../../../../components/results/audioButton';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { datasetTitles } from '@/config/metadata-config';


export default function ResultRow({ hit, nested }: { hit: any, nested?: boolean}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()
    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details



    const showInMap = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        newSearchParams.delete('search')

        router.push(`/view/${params.dataset}?${newSearchParams.toString()}`)
    }

    const goToDoc = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (searchParams.get('search') == 'show') {
            newSearchParams.set('search', 'hide')
        }

        router.push(`/view/${params.dataset}/doc/${uuid}?${newSearchParams.toString()}`)
    }

    const goToIIIF = (uuid: string, manifest: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('docs', String(uuid))
      if (searchParams.get('search') == 'show') {
        newSearchParams.set('search', 'hide')
    }

      router.push(`/view/${params.dataset}/iiif/${manifest}?${newSearchParams.toString()}`)
    }


  return (

        <li key={hit._source.uuid} className="my-0 py-2 px-2 flex flex-grow">
        <div id={"resultText_" + hit._source.uuid}>{titleRenderer(hit)}
        <p>
          { detailsRenderer(hit) }
        </p>
        </div>
        <div className='flex gap-1 ml-auto self-end'>
        { params.dataset == 'search' && !hit._source.snid &&
         <span className="self-center px-2  font-semibold text-neutral-800">UORDNA</span>
        }

        {hit._source.image && 
          <IconButton 
            onClick={() => goToIIIF(hit._source.uuid, hit._source.image.manifest)} 
            label="Vis seddel" 
            aria-current={searchParams.get('docs') == hit._source.uuid && pathname.includes('/iiif/') ? 'page': undefined}
            className="p-1 text-neutral-700">
              <PiArticleFill className="xl:text-3xl"/></IconButton> 
        }
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${hit._source.audio.file}` } 
                       className="text-3xl text-neutral-700"/> 
        }
        {hit._source.link &&
        <Link href={hit._source.link} className="no-underline" target="_blank">
          <IconButton 
            label="Ekstern ressurs"
            className="p-1 text-neutral-700 xl:text-xl">
               <PiLinkBold className="text-3xl"/>
          </IconButton> 
        </Link>
        }
        {hit._source.location && 
          <IconButton 
            onClick={() => showInMap(hit._source.uuid)} 
            label="Vis i kart" 
            aria-current={searchParams.get('docs') == hit._source.uuid && pathname == `/view/${params.dataset}` ? 'page': undefined} 
            className="p-1 text-neutral-700">
              <PiMapPinFill className="text-3xl"/></IconButton> 
        }

        { params.dataset != 'search' && <IconButton 
          onClick={() => goToDoc(hit._source.uuid)} 
          label="Infoside" 
          aria-current={params.uuid == hit._source.uuid && pathname.includes('/doc/') ? 'page': undefined} 
          aria-describedby={"resultText_" + hit._source.uuid}
          className="p-1 text-primary-600">
            <PiInfoFill className="text-3xl"/></IconButton> 
        }
        { params.dataset == 'search'  && (
          <IconButton label={"Vis treff frå " + (hit._source.children?.length == 1 ? datasetTitles[hit._source.datasets[0]]: hit._source.datasets.length  + " datasett")} 
                      textIcon 
                      aria-current={params.uuid == hit._source.uuid && pathname.includes('/doc/') ? 'page': undefined} 
                      aria-describedby={"resultText_" + hit._source.uuid}
                      onClick={() => goToDoc(hit._source.uuid)} 
                      className="flex text-sm bg-neutral-100 text-black rounded-full pl-3 pr-1 py-1 self-center whitespace-nowrap snid-button">
                      

          { hit._source.datasets?.length > 1 ? hit._source.datasets.length :  hit._source.datasets[0].toUpperCase() }<PiInfoFill className="text-xl text-primary-600 ml-1"/>
          
          </IconButton>


        )

        }
        </div>
        </li>
    )
}