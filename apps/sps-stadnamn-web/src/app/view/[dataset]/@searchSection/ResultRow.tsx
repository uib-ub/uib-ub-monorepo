import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import AudioButton from '@/components/results/audioButton';
import IconButton from '@/components/ui/icon-button';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { datasetTitles } from '@/config/metadata-config';
import CoordinateButton from '@/components/results/coordinateButton';
import ExternalLinkButton from '@/components/results/externalLinkButton';
import ImageButton from '@/components/results/imageButton';
import InfoButton from '@/components/results/infoButton';
import GroupedChildren from './grouped-children';
import Spinner from '@/components/svg/Spinner';



export default function ResultRow({ hit }: { hit: any}) {
    const params = useParams<{uuid: string; dataset: string}>()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const expanded = searchParams.get('expanded') == hit._source.uuid
    const [expandLoading, setExpandLoading] = useState(false)
    const router = useRouter()


    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details

    const toggleExpanded = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      if (expanded) {
        newSearchParams.delete('expanded')
      } else {
        setExpandLoading(true)
        newSearchParams.set('expanded', hit._source.uuid)
      }

      router.push(`${pathname}?${newSearchParams.toString()}`)
    }
    



  return (

        <li key={hit._source.uuid} className="my-0 py-2 px-2 flex flex-col">
        <div className='flex flex-grow'>
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
          <ImageButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${params.dataset}/${hit._source.audio.file}` } 
                       className="text-3xl text-neutral-700"/> 
        }
        {hit._source.link &&
        <ExternalLinkButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }
        {hit._source.location && 
          <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }

        { params.dataset == 'search'  && (
            <IconButton label={"Vis treff frå " + (hit._source.children?.length == 1 ? datasetTitles[hit._source.datasets[0]]: hit._source.datasets.length  + " datasett")} 
                        textIcon 
                        aria-expanded={expanded} 
                        aria-describedby={"resultText_" + hit._source.uuid}
                        onClick={toggleExpanded} 
                        className="flex text-sm bg-neutral-100 text-black rounded-full pr-3 pl-1 py-1 self-center whitespace-nowrap snid-button">
                        
            {expandLoading ? <Spinner status="Laster treff" className='w-[1em] h-[1em} mx-1'/> : (expanded ? <PiCaretUp className="self-center mx-1"/> : <PiCaretDown className="self-center mx-1"/>)}
            { hit._source.datasets?.length > 1 ? hit._source.datasets.length + " datasett" :  hit._source.datasets[0].toUpperCase()}
            {hit._source.children.length > 1 && ": " + hit._source.children?.length}
            
            </IconButton>


          )

        }

         { (hit._source.snid || params.dataset != 'search') && <InfoButton doc={hit} iconClass="text-3xl text-primary-600" aria-expanded={expanded} aria-describedby={"resultText_" + hit._source.uuid}
          />}
        
        
        </div>
        </div>
        {
          expanded && <GroupedChildren uuid={hit._source.uuid} childList={hit._source.children} setExpandLoading={setExpandLoading}/>
        }
        </li>
    )
}