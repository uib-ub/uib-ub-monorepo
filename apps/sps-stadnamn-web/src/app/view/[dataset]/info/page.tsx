import { datasetDescriptions, datasetPresentation, datasetTitles, subpages, publishDates } from '@/config/metadata-config'
import GoToSearchButtons from './GoToSearchButtons'
import SubpageNav from '@/components/layout/SubpageNav'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { contentSettings } from '@/config/server-config';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { PiClockCounterClockwise } from 'react-icons/pi';
import IconLink from '@/components/ui/icon-link';

export async function generateMetadata( { params }: { params: { dataset: string, subpage: number } }) {
    return {
      title: "Om " + datasetTitles[params.dataset],
      description: datasetDescriptions[params.dataset]
    }
  }

  

export default async function Subpage( { params }: { params: { dataset: string, subpage: string } }) {
    let [mainIndex, subindex] = params.dataset.split("_")

    function format_timestamp(timestamp: string) {
        const date = new Date(timestamp)
        return date.toLocaleDateString()
    }

    if (mainIndex == 'search') {
        const filePath = path.join(process.cwd(), 'src', 'app', 'info', 'snid', "page.mdx");
        const src = fs.readFileSync(filePath, 'utf8');
        return <MDXRemote source={src} /> 
    }
    

    let info = datasetPresentation[mainIndex]

    // Add subindex info if it exists
    if (subindex) {
        const { subindices, ...inheritedInfo } = info
        info = {...inheritedInfo, ...info.subindices?.[subindex]}
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'datasets', mainIndex, 'article-0.mdx');
    const src = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''

    return (
        <>
            <h2>Om {datasetTitles[mainIndex]}</h2>
            <span className='flex items-center gap-1'>
                Lagt til: {format_timestamp(publishDates[mainIndex])} <IconLink href={'/datasets/updates?dataset=' + mainIndex} label="Historikk"><PiClockCounterClockwise className="text-primary-600 text-xl"/></IconLink>
            </span>
            <div className='flex flex-col md:flex-row'>
                <div className='md:w-1/2'>
                    <p>{subindex ? datasetDescriptions[subindex] : datasetDescriptions[mainIndex]}</p>
                    <p>© {datasetPresentation[mainIndex].attribution}. Lisens: <Link href={datasetPresentation[mainIndex].license.url}>
                  {datasetPresentation[mainIndex].license.name}
                </Link></p>
                    {mainIndex && contentSettings[mainIndex]?.display != 'table' && <GoToSearchButtons dataset={mainIndex}/>}
                    {src && <MDXRemote source={src} />}

                    { subpages[mainIndex]?.length &&
                    <SubpageNav items={subpages[mainIndex].map((subpage, index) => { return { label: subpage, href: `/view/${params.dataset}/info/${index+1}`} })}>
                        <h3>Artikler</h3>
                    </SubpageNav>
                }
                </div>
                <div className='md:ml-4 md:w-[50%]'>
                    <img src={info.img} alt={info.alt || ''} className="object-cover"/>
                    <small>{info.alt} | {info.imageAttribution}</small>
                </div>
            </div>
        </>
    )


}
