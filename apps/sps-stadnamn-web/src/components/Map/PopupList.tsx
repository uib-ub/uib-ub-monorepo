
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import { resultRenderers } from '@/config/result-renderers';
import AudioButton from '@/components/results/audioButton'
import ImageButton from '@/components/results/imageButton'
import InfoButton from '@/components/results/infoButton'
import ExternalLinkButton from '@/components/results/externalLinkButton'

export default function PopupList({ docs, view }: { docs: any[], view: string} ) {



    const listItemRenderer = (doc: any) => {
        const docDataset = doc._index.split('-')[2];
        return (
            <>
            <span id={"resultText_" + doc._source.uuid}>
            { docDataset == view ?
                    <>
                        {resultRenderers[view]?.title(doc, 'map')}
                    </>
                    :
                    <>
                        {resultRenderers[docDataset]?.title(doc, 'map')}
                    </>
                } 
                </span>
                <div className='inline whitespace-nowrap'>
                    &nbsp;
                    {doc._source.image && 
                        <ImageButton doc={doc} iconClass='text-2xl align-top text-neutral-700 inline'/> 
                    }
                    {doc._source.audio && 
                        <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${docDataset}/${doc._source.audio.file}`} 
                            iconClass="text-2xl align-top inline text-neutral-700"/> 
                    }
                    {doc._source.link &&
                        <ExternalLinkButton doc={doc} iconClass='text-2xl align-top text-neutral-700 inline'/>
                    }
                    <InfoButton doc={doc} iconClass='text-2xl align-top text-primary-600 inline'/>
                </div>
                 { docDataset == view &&  <p className="!m-0">{resultRenderers[view]?.details(doc, 'map')}</p> }
                
            </>
        )
    }


    const listRenderer = () => {
      return docs.map(doc => {
          return (
          <li key={doc._source.uuid} className='text-lg inline space-x-1 py-2'>
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