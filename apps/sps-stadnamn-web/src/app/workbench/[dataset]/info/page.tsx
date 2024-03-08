import { datasetPresentation, datasetTitles, subpages } from '@/config/client-config'
import Image from 'next/image'
import Link from 'next/link'
import { PiArrowRight, PiArrowRightBold, PiCaretRightBold } from 'react-icons/pi'

export default function Subpage( { params }: { params: { dataset: string, subpage: string } }) {
    let [mainIndex, subindex] = params.dataset.split("_")

    let info = datasetPresentation[mainIndex]

    // Add subindex info if it exists
    if (subindex) {
        const { subindices, ...inheritedInfo } = info
        info = {...inheritedInfo, ...info.subindices?.[subindex]}
    }


    return (
        <>
            <h2>{datasetTitles[mainIndex]}</h2>
            <div className='flex flex-col md:flex-row'>
                <div className='md:w-1/2'>
                    <p>{info['description']}</p>
                    { subpages[mainIndex]?.length &&
                    <>
                    <h3>Artikler</h3>
                    <ul className="flex flex-col gap-3 mt-1 !list-none !pl-0">
                    { subpages[mainIndex]?.map((subpage, index) => {
                        return <li key={index}><Link className="no-underline hover:underline text-pretty" href={`/workbench/${params.dataset}/info/${index + 1}`}>{subpage}<PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/></Link></li>
                    })
                    }
                    </ul>
                    </>
                }

                    
                    
                </div>
                
                <div className='md:w-1/2 md:ml-4'>
                    <Image src={info.img} alt={info.alt || ''} width="1024" height="1024" className="object-cover"/>
                    <small>{info.alt} | {info.imageAttribution}</small>
                </div>
            </div>
        </>
    )


}
