import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars } from "react-icons/pi"
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

export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const doc = searchParams.get('doc')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()
    const group = searchParams.get('group')

    const { groupData, groupLoading, groupTotal } = useContext(GroupContext)
    

    const [ownPosition, setOwnPosition] = useState<number | undefined>(undefined)

    useEffect(() => {
      if (groupData && docData && !groupLoading && groupData?.find(doc => doc._id == docData?._id) !== undefined) {
        setOwnPosition(groupData?.findIndex((doc) => doc._id == docData?._id))
      }
    }, [groupData, docData, groupLoading])


    return <>
    <div className={`flex overflow-x-auto p-2 border-b border-neutral-200 ${(details || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
    <ClickableIcon
        label="Oppslag"
        remove={["details"]} 
        aria-selected={details == "doc"}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiBookOpenLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>
    
    <ClickableIcon
        label="Liknande treff"
        remove={["details"]} 
        add={{details: "group"}}
        aria-selected={details == "group"}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-inner relative">
        <PiBinocularsLight className="text-3xl text-neutral-900" aria-hidden="true"/>
    </ClickableIcon>

    <ClickableIcon
        label="Tidslinje"
        remove={["details"]} 
        add={{details: "timeline"}}
        aria-selected={details == "timeline"}
        className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 text-neutral-950 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiClockCounterClockwiseLight className="text-3xl text-neutral-900" aria-hidden="true"/>
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
    
    <div className={`flex flex-wrap gap-2 justify-between p-2 border-b border-neutral-200 transition-opacity duration-200 ${groupLoading ? 'opacity-50' : 'opacity-100'}`}>
    {groupTotal?.value && groupTotal.value > 1 && <div className="flex gap-2 h-10">    
      
      <ClickableIcon 
        label="Forrige" 
        className="btn btn-outline btn-compact" 
        add={{doc: groupData?.[ownPosition !== undefined ? ownPosition - 1 : 0]?.fields?.uuid?.[0]}}
        disabled={ownPosition === undefined || ownPosition <= 0}
      >
        <PiCaretLeft className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
      <span className="text-neutral-900 self-center w-10 text-center">{ownPosition ? ownPosition + 1 : 1}/{groupTotal?.value}</span>
      <ClickableIcon 
        label="Neste" 
        className="btn btn-outline btn-compact" 
        add={{doc: groupData?.[ownPosition !== undefined ? ownPosition + 1 : 0]?.fields.uuid?.[0]}}
        disabled={ownPosition === undefined || ownPosition >= (groupData?.length || 0) - 1}
      >
        <PiCaretRight className="xl:text-xl" aria-hidden="true"/>
      </ClickableIcon>
  </div>}
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



  {details == "doc" && doc && docData?._source && <div className={`lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 border-neutral-200 transition-opacity duration-200 ${docLoading ? 'opacity-50' : 'opacity-100'}`}>

 
      <DocInfo/>
  </div>}
  


  {details == "group" && <div className="lg:overflow-y-auto stable-scrollbar lg:max-h-[calc(100svh-12rem)] p-4 pb-8 border-neutral-200 ">
    <GroupDetails/>
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







