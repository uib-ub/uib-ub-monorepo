import { datasetPresentation, datasetShortDescriptions, datasetTitles, publishDates } from '@/config/metadata-config'
import Link from 'next/link';
import { PiCaretRight, PiClockCounterClockwise, PiInfoFill, PiMagnifyingGlass, PiTreeView } from 'react-icons/pi';
import IconLink from '@/components/ui/icon-link';
import { useSearchParams } from 'next/navigation';
import { treeSettings } from '@/config/server-config';
import { useQueryState } from 'nuqs';
import DatasetToolbar from '@/components/ui/dataset-toolbar';


  

export default function DatasetInfo() {
    const params = useSearchParams()
    const dataset = params.get('dataset') || 'search'
    const infoDataset = params.get('infoDataset') || dataset
    let [mainIndex, subindex] = (infoDataset).split("_")
    const searchParams = useSearchParams()
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]

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
        <aside className="dataset-info pb-8 lg:pb-0 mobile-padding">
            <h2>{datasetTitles[mainIndex]}</h2>
            {mainIndex != 'search' && <span className='flex items-center gap-1'>
                Lagt til: {format_timestamp(publishDates[mainIndex])} <IconLink href={'/info/updates?dataset=' + mainIndex} label="Historikk"><PiClockCounterClockwise className="text-primary-600 text-xl"/></IconLink>
            </span>}
            <div className='flex flex-col gap-2'>
         
                    {subindex ? <p>{datasetShortDescriptions[subindex]}</p> : <p>{datasetShortDescriptions[mainIndex]}</p>}
                    <p>© {datasetPresentation[mainIndex].attribution}. Lisens: <Link href={datasetPresentation[mainIndex].license.url}>
                  {datasetPresentation[mainIndex].license.name}
                </Link></p>
            </div>
            {infoDataset !=  dataset && <div className="flex gap-2">
                <Link href={`/search?dataset=${mainIndex}`} className="btn btn-primary">Søk i {datasetTitles[mainIndex]}</Link>
                {subindex && <Link href={`/search?dataset=${infoDataset}`} className="btn btn-neutral">Søk i {datasetTitles[infoDataset]}</Link>}
            </div>}

            <DatasetToolbar dataset={dataset}/>
            
        </aside>
    )


}
