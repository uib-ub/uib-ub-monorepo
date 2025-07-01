import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBookOpenLight, PiClockCounterClockwiseLight, PiX, PiCaretLeft, PiCaretRight, PiBinocularsLight, PiArrowsOut, PiBinoculars, PiArchiveLight, PiBinocularsFill, PiArrowElbowUpLeft, PiArrowElbowLeftUp, PiListBullets, PiListBulletsLight, PiCaretLeftBold, PiXBold, PiMapPinLight, PiArrowLeft, PiBinocularsBold, PiListLight, PiMapPin, PiMapPinFill } from "react-icons/pi"
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
import FuzzyExplorer from "../fuzzy/fuzzy-explorer"
import { GlobalContext } from "@/app/global-provider"
import { base64UrlToString, stringToBase64Url } from "@/lib/utils"
import CoordinateType from "./doc/coordinate-type"

export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const doc = searchParams.get('doc')
    const fuzzyNav = searchParams.get('fuzzyNav')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()
    const group = searchParams.get('group')

    const { coordinateVocab } = useContext(GlobalContext)


    const { groupData, groupLoading, groupTotal } = useContext(GroupContext)
    

    return <>
    <div className={`flex p-2 ${(details || mode == 'map') ? 'gap-2 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
    { groupTotal?.value && <Clickable label="Valde treff" 
          remove={["details", "fuzzyNav"]} 
          add={{details: "group"}}
          aria-selected={details == "group"}
          className="flex whitespace-nowrap rounded relative items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 px-3 aria-selected:bg-neutral-100 aria-selected:text-neutral-900 aria-selected:shadow-inner">
      <PiListLight className="text-2xl text-neutral-900 xl:sr-only" aria-hidden="true"/>
      <span className="text-neutral-900 hidden xl:flex flex-nowrap whitespace-nowrap">Valde treff</span>
      {groupTotal?.value && groupTotal.value > 0 && (
        <span className="aresults-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap px-1.5">
          {groupTotal.value}
        </span>
      )}
    </Clickable>}

    <Clickable
        label="Oppslag"
        add={{details: "doc"}} 
        aria-selected={details == "doc" || (details == "group" &&  !groupData)}
        className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        <PiBookOpenLight className="text-xl text-neutral-900" aria-hidden="true"/>
        <span className="text-neutral-900 sr-only 2xl:not-sr-only whitespace-nowrap">Oppslag</span>
    </Clickable>
    <div className="flex gap-2 ml-auto">
    
             
    <ClickableIcon
            label="Lukk"
            remove={["doc", "details", ...(fuzzyNav ? [] : ['group'])]}
            className="h-10 flex items-center p-1 pl-2" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>
  </div>

  

  {details == "doc" && <>

    


    {(groupTotal?.value || (!fuzzyNav && docData)) ?
    
    <div className={`flex flex-wrap gap-2 p-2 transition-opacity duration-200 ${groupLoading ? 'opacity-50' : 'opacity-100'}`}>
    {!fuzzyNav && <HitNavigation/>}


    

  <div className="flex gap-2 h-10">
    

    

    {(!fuzzyNav && groupData && groupData?.length > 1)  ?
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



  {(details == "doc" || (details == "group" &&  !groupData)) && doc && docData?._source && <div className={`overflow-y-auto border-y border-neutral-200 stable-scrollbar max-h-[calc(100svh-14.5rem)] lg:max-h-[calc(100svh-15.5rem)] border-neutral-200 transition-opacity duration-200 ${docLoading ? 'opacity-50' : 'opacity-100'}`}>

 
      <DocInfo/>


  </div>
}


  


  {details == "group" && <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-10rem)] xl:max-h-[calc(100svh-12rem)] p-4 pb-8 border-y border-neutral-200 ">
    <GroupDetails/>
    </div>}



    { docLoading && details == "doc" && !docData?._source && <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }


  <div className={`flex gap-2 justify-between p-2 ${docLoading ? 'opacity-50' : ''}`}>
    {doc && <div className="flex gap-2 h-10 min-w-0 flex-1">
      {docData?._source.location ? (
        <div className="flex items-center gap-1 min-w-0">
          <PiMapPinFill className="text-neutral-600 flex-shrink-0" aria-hidden="true"/>
          <span className="text-sm truncate">
            {docData?._source.coordinateType 
              ? coordinateVocab[docData?._source.coordinateType]?.label 
              : docData?._source.coordinateType}
          </span>
        </div>
      ) : (
        <em className="text-sm text-neutral-500 flex items-center gap-2 p-2">
          Utan koordinater
        </em>
      )}
    </div>}



{!fuzzyNav &&
      <Clickable

      aria-current={(fuzzyNav && group == stringToBase64Url(docData?._source.group)) ? true : false}
      
      className="btn btn-primary btn-compact aria-[current=true]:btn-accent flex items-center gap-2 ml-auto text-lg whitespace-nowrap" remove={['details']} add={{group: stringToBase64Url(docData?._source.group), fuzzyNav: fuzzyNav || 'timeline'}}>
         <PiBinocularsFill className="text-xl text-white" aria-hidden="true"/> Namneformer
      </Clickable>
}




  </div>

  

  

</>
}







