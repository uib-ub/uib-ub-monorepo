import { datasetPresentation, datasetTitles, subpages } from '@/config/metadata-config'
import GoToSearchButtons from './GoToSearchButtons'
import SubpageNav from '@/components/layout/SubpageNav'
import { MDXRemote } from 'next-mdx-remote/rsc'
import fs from 'fs';
import path from 'path';

export default function Subpage( { params }: { params: { dataset: string, subpage: string } }) {
    let [mainIndex, subindex] = params.dataset.split("_")

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


    return (
        <>
            <h2><span className='sr-only'>Om </span>{datasetTitles[mainIndex]}</h2>
            <div className='flex flex-col md:flex-row'>
                <div className='md:w-1/2'>
                    <p>{info['description']}</p>
                    <GoToSearchButtons/>
                    { subpages[mainIndex]?.length &&
                    <SubpageNav items={subpages[mainIndex].map(subpage => { return { label: subpage, href: `/view/${params.dataset}/info/${subpage}`} })}>
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
