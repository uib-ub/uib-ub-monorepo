import { fetchStats } from "@/app/api/_utils/stats";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { datasetDescriptions, datasetFeatures, datasetPresentation, datasetShortDescriptions, datasetTitles, datasetTypes, featureNames, subpages, typeNames } from "@/config/metadata-config";
import { ReactElement } from "react";
import { PiArchiveFill, PiArticleFill, PiBinaryFill, PiBooksFill, PiBoxArrowDownFill, PiDatabaseFill, PiEarFill, PiGavelFill, PiLinkSimpleFill, PiMapPinLineFill, PiMapTrifoldFill, PiSpeakerHighFill, PiWallFill } from "react-icons/pi";
import DatasetStats from "../dataset-stats";

import SubpageNav from '@/components/layout/subpage-nav';

const icons: { [key: string]: ReactElement } = {
    "image": <PiArticleFill aria-hidden="true" />,
    "audio": <PiSpeakerHighFill aria-hidden="true" />,
    "phonetic": <PiEarFill aria-hidden="true" />,
    "coordinates": <PiMapPinLineFill aria-hidden="true" />,
    "link": <PiLinkSimpleFill aria-hidden="true" />,
    "maps": <PiMapTrifoldFill aria-hidden="true" />,
    "base": <PiWallFill aria-hidden="true" />,
    "sprak": <PiArchiveFill aria-hidden="true" />,
    "encyclopedia": <PiBooksFill aria-hidden="true" />,
    "database": <PiDatabaseFill aria-hidden="true" />,
    "public": <PiGavelFill aria-hidden="true" />,
    "collection": <PiBoxArrowDownFill aria-hidden="true" />,
    "digi": <PiBinaryFill aria-hidden="true" />

};

export async function generateMetadata({ params }: { params: Promise<{ dataset: string }> }) {
    const { dataset } = await params


    return {
        title: datasetTitles[dataset],
        description: datasetShortDescriptions[dataset]
    }
}

export default async function DatasetPage({ params }: { params: Promise<{ dataset: string }> }) {
    const { dataset } = await params
    const info = datasetPresentation[dataset]
    const stats = await fetchStats()

    return <div className="flex flex-col md:flex-row gap-4 page-info">
        <div className="xl:w-2/3">
            <Breadcrumbs parentUrl={"/info/datasets"} parentName={["Informasjon", "Datasett"]} currentName={datasetTitles[dataset]} />
            <h1 className="mt-4">{datasetTitles[dataset]}</h1>
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                    <ul className='flex flex-wrap gap-2 !px-0 !py-0 !my-0 text-neutral-900'>
                        {datasetTypes[dataset]?.map((type) => (
                            <li key={type} className="flex items-center gap-1 !py-0 !my-0">
                                {icons[type]}
                                <span>{typeNames[type]}</span>
                            </li>
                        ))}
                    </ul>
                    <ul className='flex flex-wrap gap-2 !px-0 !py-0 !my-0 text-neutral-900'>
                        {datasetFeatures[dataset]?.map((feature) => (
                            <li key={feature} className="flex items-center gap-1 !py-0 !my-0">
                                {icons[feature]}
                                <span>{featureNames[feature]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <DatasetStats statsItem={stats?.datasets[dataset]} itemDataset={dataset} />

                <p>{datasetDescriptions[dataset]}</p>

                {subpages[dataset]?.length &&
                    <SubpageNav items={subpages[dataset].map((subpage, index) => { return { label: subpage, href: `${dataset}/${index + 1}` } })}>
                        <h2>Artikler</h2>
                    </SubpageNav>
                }

            </div>
        </div>
        <div className='xl:w-1/3'>
            <img src={info.img} alt="" className="object-cover" />
            <small id="dataset-illustration" className="text-neutral-700 text-xs p-1 sr-only">Illustrasjon: {info.alt} | {info.imageAttribution} {info.imageUrl && <a href={info.imageUrl.url} target="_blank" rel="noopener noreferrer">{info.imageUrl.name}</a>} {info.imageLicense && <a href={info.imageLicense.url} target="_blank" rel="noopener noreferrer">{info.imageLicense.name}</a>}</small>
        </div>

    </div>
}
