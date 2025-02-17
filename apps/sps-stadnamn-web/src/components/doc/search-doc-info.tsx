import { PiArchive, PiArchiveFill, PiBookOpen, PiBooksFill, PiCaretLeft, PiCaretRight, PiDatabaseFill, PiFiles, PiFilesFill, PiInfoFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import Timeline from "../doc/timeline";
import { datasetTitles } from "@/config/metadata-config";
import { useSearchParams } from "next/navigation";
import Etymology from "../search/info/etymology";
import { useContext } from "react";
import { GlobalContext } from "@/app/global-provider";
import { useDataset } from "@/lib/search-params";
import AudioExplorer from "./audio-explorer";



export default function SearchDocInfo({docSource}: {docSource: any}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const parent = searchParams.get('parent')
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')
    const mode = searchParams.get('mode') || 'map'
    const { isMobile } = useContext(GlobalContext)
    const dataset = useDataset()
    
    const attestationLabels = docSource.attestations?.map((item: any) => item.label)
    const uniqueLabels = new Set<string>(docSource.altLabels?.filter((label: string) => label !== docSource.label && !attestationLabels?.includes(label)))

    const hasAltLabels = uniqueLabels.size > 0
    const hasAttestations = docSource.attestations?.some((item: any) => item.label != docSource.label) && docSource.attestations?.length > 1


    return <>
    {docSource.recordings?.length > 0 && dataset == 'search' &&
          <AudioExplorer recordings={docSource.recordings}/>

        }

    
    {(docSource.datasets.includes('leks') || docSource.datasets.includes('rygh')) && 
    <Etymology etymologyDataset={docSource.datasets.includes('leks') ? 'leks' : 'rygh'} uuids={[docSource.children]}/>
    }
            
            
            




    <div className={` flex flex-col gap-2`}>
    {hasAltLabels && <ul className='flex flex-wrap !list-none !p-0 gap-1'>
    {Array.from(uniqueLabels).map((label: string, index: number) => {
      const isActive = sourceLabel === label
      return <li key={index} className='whitespace-nowrap'>
        <Clickable 
          link 
          add={{sourceLabel: label, parent: doc}} 
          remove={["sourceLabel", "sourceDataset"]} 
          className={`no-underline border shadow-sm rounded-md px-3 py-1
            ${isActive ? '!bg-accent-800 text-white border-accent-800' : 'bg-white border-neutral-200'} text-neutral-950`}
          aria-current={isActive ? 'page' : undefined}
        >
        {label}
        </Clickable></li>
    }
    )}
    </ul>}
    
    {hasAttestations && 
      <>
        
        <Timeline arr={docSource.attestations} parent={docSource.uuid}/>
      </>}

      <ul className='flex flex-col xl:flex-row xl:flex-wrap gap-1 !list-none !p-0'>
        
        {docSource.datasets.map((dataset: string, index: number) => {
          const isActive = parent && sourceDataset === dataset
          return <li key={index} className='whitespace-nowrap !m-0 !p-0'>
            <Clickable 
               
              className={`
                flex items-center gap-1 
                no-underline border rounded-md rounded-full 
                pr-3 pl-2 py-2 xl:py-1 
                w-full shadow-sm
                ${isActive ? '!bg-accent-800 text-white border-accent-800' : 'bg-white border-neutral-200'}
              `}
              add={{
                ...(docSource.datasets.length > 1 ? {sourceDataset: dataset} : {}),
                parent: docSource.uuid,
                doc: docSource.uuid,
                ...(mode != 'map' ? {mode: 'doc'} : {})
              }}
              remove={["sourceLabel", "sourceDataset"]}
              link={isMobile || mode != 'map' ? undefined : true}
              aria-expanded={isMobile ? undefined : parent ? true : false}
              aria-controls={isMobile ? undefined :'children-window'}
            >
              <PiDatabaseFill className={`${isActive ? 'text-white' : docSource.datasets.length > 1 ? 'text-neutral-700' : 'text-primary-600'}`} />
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
                pr-3 pl-2 py-2 xl:py-1 
                w-full shadow-sm
                ${parent && !sourceLabel && !sourceDataset ? '!bg-accent-800 text-white border-accent-800' : 'bg-white border-neutral-200'}
              `}
              remove={["sourceLabel", "sourceDataset"]}
              add={{
                parent: docSource.uuid,
                doc: docSource.uuid,
                ...(mode != 'map' ? {mode: 'doc'} : {})
              }}
              link={isMobile || mode != 'map' ? undefined : true}
              aria-expanded={isMobile ? undefined : parent ? true : false}
              aria-controls={isMobile ? undefined : 'children-window'}
            >
              <PiBooksFill className={`${parent && !sourceLabel && !sourceDataset ? 'text-white' : 'text-primary-600'}`} />
              Alle kjelder
            </Clickable>
          </li>
        )}
      </ul>

    
      </div>
      

      

    </>
}
