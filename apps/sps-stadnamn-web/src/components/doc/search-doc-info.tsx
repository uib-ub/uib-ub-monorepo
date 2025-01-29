import { PiDatabaseFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import Timeline from "../doc/timeline";
import { datasetTitles } from "@/config/metadata-config";
import { useSearchParams } from "next/navigation";
import Etymology from "../search/info/etymology";



export default function SearchDocInfo({docSource}: {docSource: any}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    
    const attestationLabels = docSource.attestations?.map((item: any) => item.label)
    const uniqueLabels = new Set<string>(docSource.altLabels?.filter((label: string) => label !== docSource.label && !attestationLabels?.includes(label)))

    const hasAltLabels = uniqueLabels.size > 0
    const hasAttestations = docSource.attestations?.some((item: any) => item.label != docSource.label) && docSource.attestations?.length > 1


    return <>

    
    {(docSource.datasets.includes('leks') || docSource.datasets.includes('rygh')) && 
    <Etymology etymologyDataset={docSource.datasets.includes('leks') ? 'leks' : 'rygh'} uuids={[docSource.children]}/>
    }
            
            
            




    <div className={` flex flex-col ${hasAltLabels || hasAttestations ? 'border-2 p-2 inner-slate' : ''}`}>
    {hasAltLabels && <ul className='flex flex-wrap !list-none !p-0 gap-1'>
    {Array.from(uniqueLabels).map((label: string, index: number) => {
      return <li key={index} className='whitespace-nowrap'>
        <Clickable link add={{sourceLabel: label, parent: doc}} remove={["sourceLabel", "sourceDataset"]} className="no-underline bg-white border border-neutral-200 shadow-sm rounded-full text-neutral-950 rounded-full px-3 py-1">
        {label}
        </Clickable></li>
    }
    )}
    </ul>}
    
    {hasAttestations && 
      <>
        
        {Timeline(docSource.attestations)}
      </>}

      <ul className='flex flex-wrap gap-1 !list-none !p-0'>
        {docSource.datasets.map((dataset: string, index: number) => {
          return <li key={index} className='whitespace-nowrap !m-0 !p-0'>
            <Clickable link className={`flex items-center gap-1 no-underline bg-white border border-neutral-200 shadow-sm rounded-md text-neutral-950 rounded-full pr-3 pl-2 py-1 ${hasAltLabels || hasAttestations ? 'bg-white' : ''}`} add={{sourceDataset: dataset, parent: doc}} remove={["sourceLabel", "sourceDataset"]}><PiDatabaseFill className='text-neutral-700' />{datasetTitles[dataset]}</Clickable></li>
        })}
      </ul>

    
      </div>
      

      

    </>
}
