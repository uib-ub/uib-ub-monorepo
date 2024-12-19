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
        <div className="dataset-info px-2" aria-label="Valgt datasett">
            <span>
            <h2 className="">{datasetTitles[mainIndex]} </h2>            
         
                    { datasetShortDescriptions[mainIndex]}
            </span>
                    <p className='mt-2'>© {datasetPresentation[mainIndex].attribution}. <Link className="whitespace-nowrap" href={datasetPresentation[mainIndex].license.url}>
                  {datasetPresentation[mainIndex].license.name}
                </Link></p>
   
            {infoDataset !=  dataset && <div className="flex gap-2">
                <Link href={`/search?dataset=${mainIndex}`} className="btn btn-primary">Søk i {datasetTitles[mainIndex]}</Link>
                {subindex && <Link href={`/search?dataset=${infoDataset}`} className="btn btn-neutral">Søk i {datasetTitles[infoDataset]}</Link>}
            </div>}
            <Link className="flex gap-1 items-center justify-self-end no-underline" href={"/info/datasets/" + dataset}>Les mer <PiCaretRight aria-hidden="true" className='text-primary-600'/></Link>

            { false && <DatasetToolbar dataset={dataset}/>}
            
        </div>
    )


}
