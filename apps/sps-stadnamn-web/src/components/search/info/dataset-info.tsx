import { datasetPresentation, datasetShortDescriptions, datasetTitles } from '@/config/metadata-config'
import Link from 'next/link';
import { PiCaretRight, PiFunnelFill } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import DatasetToolbar from '@/components/ui/dataset-toolbar';
import Clickable from '@/components/ui/clickable/clickable';


  

export default function DatasetInfo() {
    const params = useSearchParams()
    const dataset = params.get('dataset') || 'search'
    const infoDataset = params.get('infoDataset') || dataset
    const [mainIndex, subindex] = (infoDataset).split("_")


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
            <div className="flex gap-2 mt-2">
            {dataset == 'search' && <Clickable add={{nav: 'filters', facet: 'datasets'}} className="flex gap-1 items-center justify-self-end no-underline">Avgrens etter datasett<PiCaretRight aria-hidden="true" className='text-primary-600'/></Clickable>}
            <Link className="flex gap-1 ml-auto items-center no-underline" href={"/info/datasets/" + dataset}>Les mer <PiCaretRight aria-hidden="true" className='text-primary-600'/></Link>
            </div>
            { false && <DatasetToolbar dataset={dataset}/>}
            
        </div>
    )


}
