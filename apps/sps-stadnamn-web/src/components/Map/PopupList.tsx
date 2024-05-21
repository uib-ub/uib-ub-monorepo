
import IconButton  from '@/components/ui/icon-button'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { PiArticleFill, PiInfoFill, PiLinkBold } from 'react-icons/pi'
import AudioButton from '@/components/results/audioButton';
import Link from 'next/link';
import { resultRenderers } from '@/config/dataset-render-config';

export default function PopupList({ docs, view }: { docs: any[], view: string} ) {
    const searchParams = useSearchParams()
    const dataset = docs[0]._index.split('-')[1];
    const router = useRouter()
    const params = useParams<{uuid: string; dataset: string}>()

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

    const listItemRenderer = (doc: any) => {
        return (
            <>
            { dataset == view ?
                    <>
                        {resultRenderers[view]?.title(doc)} | {resultRenderers[view]?.details(doc)}
                    </>
                    :
                    <>
                        {doc._source.label}
                    </>
                } 
                <div className='inline space-x-1 inline'>
                    {doc._source.image && 
                        <IconButton 
                            onClick={() => goToIIIF(doc._id, doc._source.image.manifest)} 
                            label="Vis seddel">
                            <PiArticleFill className="text-xl align-top text-neutral-700 inline"/>
                        </IconButton> 
                    }
                    {doc._source.audio && 
                        <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${dataset}/${doc._source.audio.file}`} 
                            className="text-2xl align-top inline text-neutral-700"/> 
                    }
                    {doc._source.link &&
                        <Link href={doc._source.link} className="no-underline" target="_blank">
                            <IconButton 
                                label="Ekstern ressurs">
                                <PiLinkBold className="text-xl align-top text-neutral-700 inline"/>
                            </IconButton> 
                        </Link>
                    }
                    <IconButton label="Infoside" onClick={() => goToDoc(doc._source.uuid)}><PiInfoFill className='text-2xl align-top text-primary-600 inline'/></IconButton>
                </div>
                
            </>
        )
    }


    const listRenderer = () => {
      return docs.map(doc => {
          return (
          <li key={doc._id} className='text-lg inline space-x-1 py-2'>
              {listItemRenderer(doc)}
          </li>
          )
      }
      )
    }

    if (docs.length > 1) {
        return (
          <ul className='flex flex-col gap-1 divide-y divide-neutral-400'>
            {listRenderer()}
          </ul>
        )
    }
    else {
        return (
            <div className='text-lg inline space-x-1'>
                {listItemRenderer(docs[0])}
            </div>
        )
    }


    }