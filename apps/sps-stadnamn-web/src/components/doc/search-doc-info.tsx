import { PiDatabaseFill, PiFilesFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import Timeline from "../doc/timeline";
import { datasetTitles } from "@/config/metadata-config";
import { useSearchParams } from "next/navigation";
import Etymology from "../search/info/etymology";



export default function SearchDocInfo({docSource}: {docSource: any}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const parent = searchParams.get('parent')
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')
    
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
      const isActive = sourceLabel === label
      return <li key={index} className='whitespace-nowrap'>
        <Clickable 
          link 
          add={{sourceLabel: label, parent: doc}} 
          remove={["sourceLabel", "sourceDataset"]} 
          className={`no-underline border shadow-sm rounded-full px-3 py-1
            ${isActive ? '!bg-accent-700 text-white border-accent-700' : 'bg-white border-neutral-200'} text-neutral-950`}
          aria-current={isActive ? 'page' : undefined}
        >
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
          const isActive = sourceDataset === dataset
          return <li key={index} className='whitespace-nowrap !m-0 !p-0'>
            <Clickable 
               
              className={`
                flex items-center gap-1 
                no-underline border rounded-md rounded-full 
                pr-3 pl-2 py-1 
                ${isActive ? '!bg-accent-700 text-white border-accent-700' : 'bg-white border-neutral-200'}
                ${hasAltLabels || hasAttestations ? 'shadow-sm' : ''}
              `}
              add={docSource.datasets.length > 1 ? {sourceDataset: dataset, parent: doc} : {parent: doc}}
              remove={["sourceLabel", "sourceDataset"]}
              aria-expanded={parent ? true : false}
              aria-controls="children-window"


            >
              <PiDatabaseFill className={`${isActive ? 'text-white' : 'text-neutral-700'}`} />
              {datasetTitles[dataset]}
            </Clickable>
            </li>
        })}

    {docSource.datasets.length > 1 && (
          <li className='whitespace-nowrap !m-0 !p-0'>
            <Clickable 
               
              className={`
                flex items-center gap-1 
                no-underline border rounded-md rounded-full 
                pr-3 pl-2 py-1 
                ${parent && !sourceLabel && !sourceDataset ? '!bg-accent-700 text-white border-accent-700' : 'bg-white border-neutral-200'}
                ${hasAltLabels || hasAttestations ? 'shadow-sm' : ''}
              `}
              remove={["sourceLabel", "sourceDataset"]}
              add={{parent: doc}}
              aria-expanded={parent ? true : false}
              aria-controls="children-window"
            >
              <PiFilesFill className={`${parent && !sourceLabel && !sourceDataset ? 'text-white' : 'text-neutral-700'}`} />
              Alle kjelder
            </Clickable>
          </li>
        )}
      </ul>

    
      </div>
      

      

    </>
}
