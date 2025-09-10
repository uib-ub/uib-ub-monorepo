import ClickableIcon from "../../ui/clickable/clickable-icon"
import { PiBinocularsFill, PiCrop, PiX } from "react-icons/pi"
import DocInfo from "./doc/doc-info"
import { useRouter, useSearchParams } from "next/navigation"
import DocSkeleton from "../../doc/doc-skeleton"
import { useContext, useEffect } from "react"
import { useDocIndex, useGroup, useMode } from "@/lib/param-hooks"
import HitNavigation from "./hit-navigation"
import useDocData from "@/state/hooks/doc-data"
import useGroupData from "@/state/hooks/group-data"
import Clickable from "@/components/ui/clickable/clickable"
import CoordinateMenu from "./coordinate-menu"
import DocToolbar from "./doc/doc-toolbar"
import { GlobalContext } from "@/app/global-provider"
import IconButton from "@/components/ui/icon-button"



export default function DetailsWindow() {
    const searchParams = useSearchParams()
    const details = searchParams.get('details')    
    const mode = useMode()
    const { groupData, groupLoading, groupTotal, groupRefetching, groupFetching, groupViewport } = useGroupData()
    const router = useRouter()
    const docIndex = useDocIndex()
    const { groupCode } = useGroup()
    const { isMobile, mapInstance } = useContext(GlobalContext)

    const { docLoading, docData, docRefetching } = useDocData()
    const doc = searchParams.get('doc')
    const isUpdating = docLoading || groupLoading || docRefetching || groupRefetching || groupFetching



    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Check if the active element is a text input or textarea
          const activeElement = document.activeElement;
          if (activeElement?.tagName === 'INPUT' || 
              activeElement?.tagName === 'TEXTAREA' || 
              activeElement?.getAttribute('contenteditable') === 'true') {
              return;
          }

          
          
          if (!e.shiftKey) return;
          
          if (e.key === 'ArrowLeft') {
              if (docIndex <= 0) return;
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              params.set('docIndex', docIndex - 1 + '');
              router.push(`?${params.toString()}`);
          }
          
          if (e.key === 'ArrowRight') {
              e.preventDefault();
              if (docIndex >= (groupTotal?.value || 0) - 1) return;
              const params = new URLSearchParams(searchParams);
              params.set('docIndex', docIndex + 1 + '');
              router.push(`?${params.toString()}`);
          }
          if (e.key === 'ArrowUp') {
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              if (details === 'list') {
                  params.set('details', 'timeline');
                  router.push(`?${params.toString()}`);
              }
              else if (details === 'timeline') {
                params.set('details', 'datasets');
                router.push(`?${params.toString()}`);
                  
              }
              else if (details === 'datasets') {
                  params.delete('details');
                  params.delete('doc')
                  router.push(`?${params.toString()}`);
              }
          }
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              const params = new URLSearchParams(searchParams);
              
              if (!details && groupTotal?.value && groupTotal.value > 1) {
                  params.set('details', 'datasets');
                  router.push(`?${params.toString()}`);
                  
              }
              else if (details === 'datasets') {
                  params.set('details', 'timeline');
                  router.push(`?${params.toString()}`);
                  

              }
              else if (details === 'timeline') {
                  params.set("details", "list")
                  router.push(`?${params.toString()}`);
                  
                  
              }

              
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docIndex, router, searchParams, groupTotal, details]);
    

    return <>
    {groupCode && !doc && <div className={`flex p-2 ${groupCode ? 'border-b border-neutral-200' : ''} ${( mode == 'map') ? 'gap-2 p-2' : 'flex-col gap-4 py-4 px-2' }`}>

        {(groupCode) && <>
        

    


    {(groupTotal?.value || ((!details || details == 'group') && docData)) ?

    <div className="flex flex-col gap-2">
    <div className={`flex gap-2 transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>

{!doc && <HitNavigation/>}


{!doc && groupData?.[0]?._source?.group &&
    <Clickable
    aria-current={((!details || details == 'group') && groupCode == groupData[0]._source.group) ? true : false}
    className="btn btn-outline btn-compact aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-10 self-end" 
    add={{details: 'overview'}}>
    <PiBinocularsFill className="text-lg text-primary-600" aria-hidden="true"/>Liknande oppslag
    
    </Clickable>
}
   
      
  </div>
  </div>
  : <div className="flex gap-2 justify-between p-2">
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

    
    <div className="flex gap-2 ml-auto">
    
             
    <ClickableIcon
            label="Lukk"
            remove={[...doc ? ["doc"] : ["group", "docIndex", "details"]]}

            className="h-10 flex items-center p-1 pl-2" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>
  </div>
  </div>
}
{ doc &&<ClickableIcon
            label="Lukk"
            remove={[...doc ? ["doc"] : ["group", "docIndex", "details"]]}

            className="h-10 flex absolute top-2 right-2 items-center p-1 pl-2" >
            <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
    </ClickableIcon>}

  

{ !docData?._source ? <div className="relative break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> 
: <div className={`overflow-y-auto stable-scrollbar max-h-[calc(100svh-14.5rem)] lg:max-h-[calc(100svh-15.5rem)] border-neutral-200 transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
<DocInfo/>
</div> }

  {(docLoading || groupLoading) ? <div className="p-4 flex gap-2"><div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"/> <div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"/><div className="h-10 w-10 bg-neutral-900/10 rounded animate-pulse"/></div>
  : <div className={`flex gap-2 border-t border-neutral-200 ${isMobile ? 'justify-end' : ''} p-2 items-center ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
    {docData?._source.location && <CoordinateMenu/>}
    <DocToolbar docData={docData}/>

  </div>
    }
  </>


}







