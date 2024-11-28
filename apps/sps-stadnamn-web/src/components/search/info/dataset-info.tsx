import { datasetPresentation, datasetShortDescriptions, datasetTitles, publishDates } from '@/config/metadata-config'
import Link from 'next/link';
import { PiCaretRight, PiClockCounterClockwise, PiInfoFill, PiMagnifyingGlass, PiTreeView } from 'react-icons/pi';
import IconLink from '@/components/ui/icon-link';
import { useSearchParams } from 'next/navigation';
import { treeSettings } from '@/config/server-config';
import { useQueryState } from 'nuqs';


  

export default function DatasetInfo() {
    const params = useSearchParams()
    const dataset = params.get('dataset') || 'search'
    const infoDataset = params.get('infoDataset') || dataset
    let [mainIndex, subindex] = (infoDataset).split("_")
    const searchParams = useSearchParams()
    const mode = useQueryState('mode', {defaultValue: 'search'})[0]

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
        <aside className="dataset-info pb-8 lg:pb-0">
            <h2>{datasetTitles[mainIndex]}</h2>
            {mainIndex != 'search' && <span className='flex items-center gap-1'>
                Lagt til: {format_timestamp(publishDates[mainIndex])} <IconLink href={'/datasets/updates?dataset=' + mainIndex} label="Historikk"><PiClockCounterClockwise className="text-primary-600 text-xl"/></IconLink>
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

            <nav className="flex gap-2 flex-wrap pt-2 pb-2">
             <Link href={`?dataset=${dataset}&mode=tree`} 
                    aria-current={mode == 'tree' ? 'page' : false}
                    onClick={() => {
                                    // set current url as storedSearchQuery in localstorage
                                    localStorage?.setItem('storedSearchQuery', searchParams.toString())
                                }}
                    className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiTreeView aria-hidden="true"/> Register</Link>
                <Link aria-current={mode == 'search' ? 'page' : false}
                      href={`?dataset=${dataset}`} 
                      className="flex whitespace-nowrap items-center gap-1 no-underline bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-accent-200">
                        <PiMagnifyingGlass aria-hidden="true"/> Søk
                </Link>
                <Link href={`/info/datasets/${dataset}`} className="flex whitespace-nowrap items-center gap-1 no-underline lg:ml-auto bg-neutral-100 w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2">Les mer<PiCaretRight className="text-primary-600" aria-hidden="true"/></Link>
            </nav>
        </aside>
    )


}
