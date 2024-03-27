
import IconButton  from '@/components/ui/icon-button'
import { useSearchParams } from 'next/navigation'
import { PiArticleFill, PiInfoFill, PiLinkBold } from 'react-icons/pi'
import AudioButton from '@/components/results/audioButton';
import Link from 'next/link';
import { resultRenderers } from '@/config/dataset-render-config';

export default function PopupList({ docs, view }: { docs: any[], view: string} ) {
    const searchParams = useSearchParams()

    const goToView = (uuid: string, view: string, manifest?: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('docs', String(uuid))
        params.set('view', String(view))
        if (manifest) {
          params.set('manifest', String(manifest))
        }
    }
        
    return (
        <ul className='flex flex-col'>
        {docs.map(doc => {
            const dataset = doc._index.split('-')[1];
            return (
            <li key={doc._id} className='text-lg inline space-x-1'>
                
              
              <span className='inline space-x-1'>
                {doc._source.image && 
                  <IconButton 
                    onClick={() => goToView(doc._id, 'image', doc._source.image.manifest)} 
                    label="Vis seddel">
                      <PiArticleFill className="text-xl text-neutral-700 inline"/>
                  </IconButton> 
                }
                {doc._source.audio && 
                  <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${dataset}/${doc._source.audio.file}`} 
                    className="text-2xl inline text-neutral-700"/> 
                }
                {doc._source.link &&
                  <Link href={doc._source.link} className="no-underline" target="_blank">
                    <IconButton 
                      label="Ekstern ressurs">
                        <PiLinkBold className="text-xl text-neutral-700 inline"/>
                    </IconButton> 
                  </Link>
                }
                <IconButton label="Infoside"><PiInfoFill className='text-2xl text-primary-600 inline'/></IconButton>
              </span>
              { dataset == view ?
                  <div>
                  {resultRenderers[dataset]?.title(doc)}
                  {resultRenderers[dataset]?.details(doc)}
                  </div>
                  :
                  <>
                  {doc._source.label}
                  </>
                  
                } 
            </li>
            )
        }
        )}
        
        </ul>
    )
    }