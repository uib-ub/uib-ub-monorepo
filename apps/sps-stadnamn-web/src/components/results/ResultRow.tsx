import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { PiCaretDown, PiCaretUp, PiX } from 'react-icons/pi';
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
import IconLink from '@/components/ui/icon-link';
import ResultLink from './resultLink';



export default function ResultRow({ hit, adm = true, externalLoading}: { hit: any, adm?: boolean, externalLoading?: boolean} ) {
    const params = useParams<{uuid: string; dataset: string}>()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const expanded = searchParams.get('expanded') == hit._source.uuid
    const [expandLoading, setExpandLoading] = useState(false)
    const router = useRouter()
    const display = searchParams.get('display') || 'map'

    const isPinned = searchParams.has('expanded') && [...searchParams.keys()].filter(key => key != 'expanded' && key != 'popup').length == 0


    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details
    const snippetRenderer = resultRenderers[params.dataset]?.snippet;

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

        <li key={hit._source.uuid} className="my-0 py-2 px-2 flex flex-col gap-4">
        <div className='flex flex-wrap gap-4'>
        <div className="flex flex-col gap-2" id={"resultText_" + hit._source.uuid}><div className="space-y-4"><h3 className="text-lg"><ResultLink doc={hit}>{titleRenderer(hit, display)}</ResultLink></h3>{adm && <>{detailsRenderer(hit, display)}</>}</div>

        {(adm || hit.highlight) && <div>
          
          {hit.highlight && snippetRenderer && snippetRenderer(hit, display)}
          

        </div>}
        </div>
        <div className='flex gap-2 ml-auto'>
        { params.dataset == 'search' && hit._source.children.length == 1 &&
         <IconLink label={datasetTitles[hit._source.datasets[0]]} textIcon href={`/view/${hit._source.datasets[0]}/info`} className="self-center px-2  text-neutral-900 small-caps text-xl no-underline">{hit._source.datasets[0]}</IconLink>
        }

        {hit._source.image && 
          <ImageButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }
        
        {hit._source.audio && 
          <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/hord/${hit._source.audio.file}` } 
                       iconClass="text-3xl text-neutral-700"/> 
        }
        {hit._source.link &&
        <ExternalLinkButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }
        {hit._source.location && 
          <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
        }

        { params.dataset == 'search' && hit._source.children.length > 1 && !isPinned && (
            <IconButton label={"Vis " + hit._source.children.length  + " oppslag i datasetta"} 
                        textIcon 
                        aria-expanded={expanded} 
                        aria-describedby={"resultText_" + hit._source.uuid}
                        onClick={toggleExpanded} 
                        className="flex text-sm bg-neutral-100 text-black rounded-full pr-3 pl-1 py-1 self-center whitespace-nowrap snid-button">
                        
            {((externalLoading===undefined ?  expandLoading : externalLoading) && expanded) ? <Spinner status="Laster treff" className='w-[1em] h-[1em} self-center mx-1'/> : (expanded ? <PiCaretUp className="self-center mx-1"/> : <PiCaretDown className="self-center mx-1"/>)}
            
            {hit._source.children?.length}
            
            </IconButton>


          )

        }
        {isPinned && <IconButton label="Lukk" textIcon onClick={() => router.push(pathname)} className="flex self-center text-neutral-900"><PiX className="text-3xl"/></IconButton>}

        
        
        </div>
        </div>
        {
          expanded && searchParams.get('display') != 'table' && <GroupedChildren snid={hit._source.snid} uuid={hit._source.uuid} childList={hit._source.children} setExpandLoading={setExpandLoading}/>
        }
        </li>
    )
}