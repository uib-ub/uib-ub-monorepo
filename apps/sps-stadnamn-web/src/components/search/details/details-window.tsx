import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars, PiArchiveLight, PiBinocularsFill, PiArrowElbowUpLeft, PiArrowElbowLeftUp, PiListBullets, PiListBulletsLight } from "react-icons/pi"
import Link from "next/link"
import DocInfo from "./doc/doc-info"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "../../doc/doc-skeleton"
import { useContext, useEffect, useState } from "react"
import { DocContext } from "@/app/doc-provider"
import CopyLink from "../../doc/copy-link"
import { useMode } from "@/lib/search-params"
import GroupDetails from "./group/group-details"
import { GroupContext } from "@/app/group-provider"
import IconLink from "@/components/ui/icon-link"
import Clickable from "@/components/ui/clickable/clickable"
import ResultItem from "../nav/results/result-item"
import HitNavigation from "./hit-navigation"
import FuzzyExplorer from "./fuzzy/fuzzy-explorer"

export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const doc = searchParams.get('doc')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()
    const group = searchParams.get('group')

    const { groupData, groupLoading, groupTotal } = useContext(GroupContext)
    

    return <>
    <div className={`flex overflow-x-auto p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
    {groupTotal?.value && <ClickableIcon label="Valde treff" 
          remove={["details"]} 
          add={{details: "group"}}
          aria-selected={details == "group"}
          className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-inner relative group">
      <PiListBulletsLight className="text-3xl text-neutral-900" aria-hidden="true"/>
      {groupTotal?.value && groupTotal.value > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary-600 group-aria-selected:bg-accent-800 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 font-medium">
          {groupTotal.value}
        </span>
      )}
    </ClickableIcon>}
    <ClickableIcon
        label="Oppslag"
        remove={["details"]} 
        aria-selected={details == "doc"}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiBookOpenLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>
    <ClickableIcon
        label="Finn andre navneformer"
        remove={["details"]} 
        add={{details: "fuzzy"}}
        aria-selected={details == "fuzzy"}
        className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-innere">
        <PiBinoculars className="text-3xl text-neutral-900 group-aria-selected:text-accent-800" aria-hidden="true"/>

    </ClickableIcon>
    
    
    

    
    <ClickableIcon
            label="Lukk"
            remove={["doc", "docDataset", "group"]} 
            className="ml-auto" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>

  {details == "doc" && <>

    {(groupTotal?.value || !group) ?
    
    <div className={`flex flex-wrap gap-2 p-2 border-b border-neutral-200 transition-opacity duration-200 ${groupLoading ? 'opacity-50' : 'opacity-100'}`}>
    <HitNavigation/>

  <div className="flex gap-2 h-10">

    {(groupData && groupData?.length > 1)  ?
    <>
 
      <CopyLink uuid={docData?._source?.uuid} isIconButton={true} className="btn btn-outline btn-compact"/> 
      <IconLink label="Åpne" href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
        <PiArrowsOut className="xl:text-xl" aria-hidden="true"/>
      </IconLink>
      
      </>
      :
      <>
      <CopyLink uuid={docData?._source?.uuid} isIconButton={false} className="btn btn-outline btn-compact"/> 
      <Link href={`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${docData?._source?.uuid}`} className="btn btn-outline btn-compact flex items-center gap-2">
        <PiArrowsOut className="text-xl" aria-hidden="true"/> Åpne
      </Link>
      </>
  }
  
      

  </div>
  </div>
  : <div className="flex flex-wrap gap-2 justify-between p-2 border-b border-neutral-200">
  {/* Navigation buttons skeleton */}
  <div className="flex gap-2 h-10">
      <div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"></div>
      <div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"></div>
      <div className="h-10 w-24 bg-neutral-900/10 rounded animate-pulse"></div>
  </div>
</div>
  
  }
  </>
}



  {details == "doc" && doc && docData?._source && <div className={`lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] border-neutral-200 transition-opacity duration-200 ${docLoading ? 'opacity-50' : 'opacity-100'}`}>

 
      <DocInfo/>


  </div>
}


  


  {details == "group" && <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <GroupDetails/>
    </div>}

    {details == "fuzzy" && <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <FuzzyExplorer/>
    </div>}


  { docLoading && details == "doc" && !docData?._source && <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }


  {/* TODO: move coordinate info out of doc info and add button to locate in map
  { details == 'doc' && docData?._source && <div className="flex flex-wrap gap-2 justify-between p-2 border-t border-neutral-200">
    <div className="flex gap-2 h-10">
      {docData?._source.location && <ClickableIcon label="Vis på kart" className="btn btn-outline btn-compact" remove={["center", "zoom"]} add={{zoom: '18', center: docData?._source.location.coordinates.toReversed().join(',')}}>
        <PiMapPinLight className="text-xl" aria-hidden="true"/>
      </ClickableIcon>}
    </div>
  </div>}
  */}
  

  

</>
}







