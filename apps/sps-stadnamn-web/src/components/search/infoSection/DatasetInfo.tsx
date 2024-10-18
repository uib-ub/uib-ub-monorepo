import { datasetPresentation, datasetShortDescriptions, datasetTitles, publishDates } from '@/config/metadata-config'
import Link from 'next/link';
import { PiClockCounterClockwise } from 'react-icons/pi';
import IconLink from '@/components/ui/icon-link';
import { useSearchParams } from 'next/navigation';


  

export default function DatasetInfo() {
    const params = useSearchParams()
    let [mainIndex, subindex] = (params.get('dataset') || 'search').split("_")

    function format_timestamp(timestamp: string) {
        const date = new Date(timestamp)
        return date.toLocaleDateString("nb-NO");
    }


    let info = datasetPresentation[mainIndex]

    // Add subindex info if it exists
    if (subindex) {
        const { subindices, ...inheritedInfo } = info
        info = {...inheritedInfo, ...info.subindices?.[subindex]}
    }

    return (
        <aside className="dataset-info">
            <h2>{datasetTitles[mainIndex]}</h2>
            {mainIndex != 'search' && <span className='flex items-center gap-1'>
                Lagt til: {format_timestamp(publishDates[mainIndex])} <IconLink href={'/datasets/updates?dataset=' + mainIndex} label="Historikk"><PiClockCounterClockwise className="text-primary-600 text-xl"/></IconLink>
            </span>}
            <div className='flex flex-col gap-2'>
         
                    <p>{subindex ? datasetShortDescriptions[subindex] : datasetShortDescriptions[mainIndex]}</p>
                    <p>© {datasetPresentation[mainIndex].attribution}. Lisens: <Link href={datasetPresentation[mainIndex].license.url}>
                  {datasetPresentation[mainIndex].license.name}
                </Link></p>
            </div>
            {infoDataset !=  dataset && <div className="flex gap-2">
                <Link href={`/search?dataset=${mainIndex}`} className="btn btn-primary">Søk i {datasetTitles[mainIndex]}</Link>
                {subindex && <Link href={`/search?dataset=${infoDataset}`} className="btn btn-neutral">Søk i {datasetTitles[infoDataset]}</Link>}
            </div>}
        </aside>
    )


}
