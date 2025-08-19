import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiX } from "react-icons/pi"
import Link from "next/link"
import DocInfo from "./doc/doc-info"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "../../doc/doc-skeleton"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import CopyLink from "../../doc/copy-link"
import { useMode } from "@/lib/search-params"
import GroupDetails from "./group/group-details"
import { GroupContext } from "@/app/group-provider"
import IconLink from "@/components/ui/icon-link"
import Clickable from "@/components/ui/clickable/clickable"
import HitNavigation from "./hit-navigation"
import DetailsFooter from "./details-footer"
import DetailsTabs from "./details-tabs"
import DocToolbar from "./doc/doc-toolbar"



export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details') || 'doc'
    const doc = searchParams.get('doc')
    const namesNav = searchParams.get('namesNav')
    const { docLoading, docData } = useContext(DocContext)
    const mode = useMode()
    const { groupData, groupLoading, groupTotal } = useContext(GroupContext)
    

    return <>
    <div className={`flex tabs p-2 ${(details || mode == 'map') ? 'gap-2 p-2' : 'flex-col gap-4 py-4 px-2' }`}>
   

    {mode != 'table' ? <DetailsTabs/> : <DocToolbar docData={docData}/>}
    <div className="flex gap-2 ml-auto">
    
             
    <ClickableIcon
            label="Lukk"
            remove={[...mode == "map" && !namesNav ? ["group"] : [], "doc", "details"]}

            className="h-10 flex items-center p-1 pl-2" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>
  </div>

  

  {details == "doc" && mode != 'table' && <>

    


    {(groupTotal?.value || (!namesNav && docData)) ?
    
    <div className={`flex flex-wrap gap-2 p-2 transition-opacity duration-200 ${groupLoading ? 'opacity-50' : 'opacity-100'}`}>
    {!namesNav && <HitNavigation/>}

   {mode != 'table' && <DocToolbar docData={docData}/>}

      
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



  {(details == "doc" || (details == "group" &&  !groupData)) && docData?._source && <div className={`overflow-y-auto border-y border-neutral-200 stable-scrollbar max-h-[calc(100svh-14.5rem)] lg:max-h-[calc(100svh-15.5rem)] border-neutral-200 transition-opacity duration-200 ${docLoading ? 'opacity-50' : 'opacity-100'}`}>

      <DocInfo/>
  </div>
}


  


  {details == "group" && <div className="overflow-y-auto stable-scrollbar max-h-[calc(100svh-10rem)] xl:max-h-[calc(100svh-12rem)] p-4 pb-8 border-y border-neutral-200 ">
    <GroupDetails/>
    </div>}



    { docLoading && details == "doc" && !docData?._source && <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }


  <DetailsFooter/>

  
</>
}







