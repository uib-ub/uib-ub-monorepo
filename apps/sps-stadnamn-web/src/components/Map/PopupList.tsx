
import IconButton  from '@/components/ui/icon-button'
import { useSearchParams } from 'next/navigation'
import { PiArticleFill, PiInfoFill, PiLinkBold } from 'react-icons/pi'
import AudioButton from '@/app/search/[dataset]/results/audioButton';
import Link from 'next/link';

export default function PopupList({ docs, dataset }: { docs: any[], dataset: string} ) {
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
        <ul>
        {docs.map(doc => (
            <li key={doc._id} className='flex text-lg justify-between align-middle'>
              <div>
                <strong className="">{doc._source.label}</strong>
              </div>
              <span className='flex gap-1'>
                {doc._source.image && 
                  <IconButton 
                    onClick={() => goToView(doc._id, 'image', doc._source.image.manifest)} 
                    label="Vis seddel">
                      <PiArticleFill className="text-xl text-neutral-700"/>
                  </IconButton> 
                }
                {doc._source.audio && 
                  <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${dataset}/${doc._source.audio.file}`} 
                    className="text-xl text-neutral-700"/> 
                }
                {doc._source.link &&
                  <Link href={doc._source.link} className="no-underline" target="_blank">
                    <IconButton 
                      label="Ekstern ressurs">
                        <PiLinkBold className="text-xl text-neutral-700"/>
                    </IconButton> 
                  </Link>
                }
                <IconButton label="Infoside"><PiInfoFill className='text-2xl text-primary-600'/></IconButton>
              </span>
            </li>
          ))}
          </ul>
    )
    }