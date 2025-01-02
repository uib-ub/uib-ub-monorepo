import Breadcrumbs from "@/components/layout/breadcrumbs";
import { datasetFeatures, datasetPresentation, datasetTitles, featureNames } from "@/config/metadata-config"
import { datasetDescriptions, datasetShortDescriptions, datasetTypes, typeNames } from "@/config/metadata-config"
import { PiArticleFill, PiFileAudioFill, PiEarFill, PiMapPinLineFill, PiLinkSimpleFill, PiMapTrifoldFill, PiWallFill, PiArchiveFill, PiBooksFill, PiDatabaseFill, PiGavelFill } from "react-icons/pi"

const icons: {[key: string]: JSX.Element} ={
    "image": <PiArticleFill aria-hidden="true"/>,
    "audio": <PiFileAudioFill aria-hidden="true"/>,
    "phonetic": <PiEarFill aria-hidden="true"/>,
    "coordinates": <PiMapPinLineFill aria-hidden="true"/>,
    "link": <PiLinkSimpleFill aria-hidden="true"/>,
    "maps": <PiMapTrifoldFill aria-hidden="true"/>,
    "base": <PiWallFill aria-hidden="true"/>,
    "sprak": <PiArchiveFill aria-hidden="true"/>,
    "encyclopedia": <PiBooksFill aria-hidden="true"/>,
    "database": <PiDatabaseFill aria-hidden="true"/>,
    "public": <PiGavelFill aria-hidden="true"/>

  };

export async function generateMetadata( { params }: { params: Promise<{ dataset: string }> }) {
    const { dataset } = await params
    
    
    return {
      title: "Om " + datasetTitles[dataset],
      description: datasetShortDescriptions[dataset]
    }
  }

export default async function DatasetPage({params}: {params: Promise<{dataset: string}>}) {
    const { dataset } = await params
    const info = datasetPresentation[dataset]

    return <div className="flex flex-col md:flex-row gap-4 dataset-info">
        <div className="xl:w-2/3">
        <Breadcrumbs parentUrl={["/info", "/info/datasets"]} parentName={["Informasjon", "Datasett"]} currentName={datasetTitles[dataset]}/>
        <h1>{datasetTitles[dataset]}</h1>
        <ul className='flex flex-wrap gap-2 !px-0 !pt-0 !mt-0 text-neutral-900'>
                {datasetTypes[dataset]?.map((type) => (
                    <li key={type} className="flex items-center gap-1">
                    {icons[type]}
                    <span>{typeNames[type]}</span>
                    </li>
                ))}
                </ul>
        <p>{datasetDescriptions[dataset]}</p>
        <div className="space-y-2">
                <h4>Ressurser</h4>
                <ul className='flex flex-wrap gap-2 !px-0 !pt-1 !mt-0 text-neutral-900'>
                {datasetFeatures[dataset]?.map((feature) => (
                    <li key={feature} className="flex items-center gap-1">
                    {icons[feature]}
                    <span>{featureNames[feature]}</span>
                    </li>
                ))}
                </ul>
        </div>
        </div>
        <div className='xl:w-1/3'>
        <img src={info.img} alt={info.alt || ''} className="object-cover"/>
        <small>Illustrasjon: {info.alt} | Foto: {info.imageAttribution}</small>
        </div>

    </div>
}
