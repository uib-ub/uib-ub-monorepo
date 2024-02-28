import { datasetPresentation, datasetTitles } from '@/config/datasets'
import Image from 'next/image'

export default function DatasetInfoView({ dataset }: { dataset: string}) {
    const info = datasetPresentation[dataset]

    return (
        <div className="p-8 flex flex-col gap-2 !overflow-y-auto">
            <h1 className="text-2xl font-bold">{datasetTitles[dataset]}</h1>
            <div className='flex flex-col md:flex-row'>
                <div className='md:w-1/2'>
                    <p>{datasetPresentation[dataset]['description']}</p>
                </div>
                <div className='md:w-1/2 md:ml-4'>
                    <Image src={info.img} alt={info.alt || ''} width="1024" height="1024" className="object-cover w-full h-full"/>
                    <small>{info.alt} | {info.imageAttribution}</small>
                </div>
            </div>
        </div>
    )


}
