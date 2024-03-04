import { datasetPresentation, datasetTitles } from '@/config/client-config'
import Image from 'next/image'

export default function DatasetInfoView({ dataset }: { dataset: string}) {
    let [mainIndex, subindex] = dataset.split("_")

    let info = datasetPresentation[mainIndex]

    // Add subindex info if it exists
    if (subindex) {
        const { subindices, ...inheritedInfo } = info
        info = {...inheritedInfo, ...info.subindices?.[subindex]}
    }


    return (
        <div className="p-8 flex flex-col gap-2 !overflow-y-auto">
            <h1>{datasetTitles[dataset]}</h1>
            <div className='flex flex-col md:flex-row'>
                <div className='md:w-1/2'>
                    <p>{info['description']}</p>
                </div>
                <div className='md:w-1/2 md:ml-4'>
                    <Image src={info.img} alt={info.alt || ''} width="1024" height="1024" className="object-cover w-full h-full"/>
                    <small>{info.alt} | {info.imageAttribution}</small>
                </div>
            </div>
        </div>
    )


}
