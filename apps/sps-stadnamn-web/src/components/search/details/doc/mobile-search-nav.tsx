'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { stringToBase64Url } from '@/lib/param-utils'
import useCollapsedData from '@/state/hooks/collapsed-data'
import { PiBinocularsBold, PiBinocularsFill, PiBinocularsLight, PiBookOpenFill, PiBookOpenLight, PiCaretLeftBold, PiCaretRightBold, PiCaretUpBold, PiClock, PiClockBold, PiClockFill, PiClockLight, PiDatabaseFill, PiDatabaseLight, PiMicroscopeFill, PiMicroscopeLight, PiSignpost, PiSignpostFill, PiSignpostLight, PiTreeViewFill, PiTreeViewLight, PiWallFill, PiWallLight } from 'react-icons/pi'
import ClickableIcon from '@/components/ui/clickable/clickable-icon'
import Clickable from '@/components/ui/clickable/clickable'

export default function MobileSearchNav({ currentPosition, drawerContent, showScrollToTop, scrollableContent }: { currentPosition: number, drawerContent: string, showScrollToTop: boolean, scrollableContent: React.RefObject<HTMLDivElement> }) {

  const searchParams = useSearchParams()
  const { collapsedData, collapsedHasNextPage, collapsedFetchNextPage } = useCollapsedData()
  const group = searchParams.get('group')
  const groupDecoded = group ? atob(decodeURIComponent(group)) : null
  const [nextGroup, setNextGroup] = useState<Record<string, any> | null>(null)
  const [prevGroup, setPrevGroup] = useState<Record<string, any> | null>(null)
  const datasetTag = searchParams.get('datasetTag')
  const namesNav = searchParams.get('namesNav')
  const doc = searchParams.get('doc')

  const { flattenedPages, groupPosition } = useMemo((): { flattenedPages: any[]; groupPosition: number } => {
    const flattenedPages = collapsedData?.pages.flatMap(page => page.data ?? []) ?? [];
    const groupPosition = flattenedPages.findIndex(doc => doc.fields['group.id']?.[0] === groupDecoded);
    console.log('Group Position:', groupPosition, 'for group:', groupDecoded);
    return { flattenedPages, groupPosition };
  }, [collapsedData, groupDecoded]);


  const scrollToTop = () => {
    if (scrollableContent.current) {
      scrollableContent.current.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  };


  useEffect(() => {
    if (groupPosition === undefined || groupPosition === -1 || groupPosition == flattenedPages?.length - 1 && !collapsedHasNextPage) {
      setNextGroup(null)
      setPrevGroup(null)
      return
    }
    else if (groupPosition == flattenedPages?.length - 1 && collapsedHasNextPage) {
      collapsedFetchNextPage()
      return
    }
    else {
      setNextGroup(flattenedPages?.[groupPosition + 1])
      setPrevGroup(groupPosition > 0 ? flattenedPages?.[groupPosition - 1] : null)
    }

  }, [collapsedData, groupPosition, flattenedPages, collapsedHasNextPage, collapsedFetchNextPage])


  if (currentPosition != 80) {
    return null

  }




  return (
    <>
    <div className={`absolute bottom-14 m-3 left-0 flex shrink-1 justify-between gap-3 z-[5000] transition-all duration-300 ease-in-out rounded-full`}
      style={{
        transform: currentPosition == 80 ? 'translateY(0)' : 'translateY(100%)',
        opacity: currentPosition == 80 ? 1 : 0,
        pointerEvents: currentPosition == 80 ? 'auto' : 'none'
      }}>
        {drawerContent == 'details' && doc && <div className="flex gap-1">
          <Clickable remove={['doc']} className="btn btn-outline rounded-full shadow-lg h-12 flex items-center justify-center gap-2">
            <PiCaretLeftBold className="text-xl" aria-hidden="true" />Tilbake
          </Clickable>
        </div>}
      {drawerContent == 'details' && !doc && <>

        
        {/* Show "Finn namneformer" if group is not grunnord */}
        {group && !groupDecoded?.startsWith('grunnord') ? <>
        <ClickableIcon label="Oppslag"
            remove={['namesNav']}
            aria-current={!namesNav ? 'page' : 'false'}
            className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"  
          >
            {!namesNav ? <PiBookOpenFill className="text-xl" aria-hidden="true" /> : <PiBookOpenLight className="text-xl" aria-hidden="true" />}
          </ClickableIcon>
          
          <ClickableIcon
            label="Tidslinje"
            remove={['doc']}
            add={{
              group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
              namesNav: 'timeline'
            }}
            aria-current={(namesNav == 'timeline' && !doc) ? 'page' : 'false'}
            className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
          >
            {(namesNav == 'timeline' && !doc )? <PiClockFill className="text-xl" aria-hidden="true" /> : <PiClockLight className="text-xl" aria-hidden="true" />}
          </ClickableIcon>
          <ClickableIcon
            label="Namn"
            remove={['doc']}
            add={{
              group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
              namesNav: 'names'
            }}
            aria-current={(namesNav == 'names' && !doc) ? 'page' : 'false'}
            className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
          >
            {(namesNav == 'names' && !doc )? <PiSignpostFill className="text-xl" aria-hidden="true" /> : <PiSignpostLight className="text-xl" aria-hidden="true" />}
          </ClickableIcon>
          <ClickableIcon
            label="Oversikt"
            remove={['doc']}
            add={{
              group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
              namesNav: 'overview'
            }}
            aria-current={(namesNav == 'overview' && !doc) ? 'page' : 'false'}
            className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
          >
            {(namesNav == 'overview' && !doc )? <PiBinocularsFill className="text-xl" aria-hidden="true" /> : <PiBinocularsLight className="text-xl" aria-hidden="true" />}
          </ClickableIcon>

        </> : null}
        {/* End "Finn namneformer" */}
      </>}


      {drawerContent == 'datasets' && <>
        <ClickableIcon
          label="Alle"
          remove={["datasetTag"]}
          aria-current={!datasetTag ? 'page' : 'false'}
          className={`bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12`}
        >
          {!datasetTag ?
            <PiDatabaseFill className="text-3xl text-white" /> :
            <PiDatabaseLight className="text-3xl" />}
        </ClickableIcon>

        <ClickableIcon
          label="Djupinnsamlingar"
          add={{ datasetTag: 'deep' }}
          aria-current={datasetTag == 'deep' ? 'page' : 'false'}
          className={`bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12`}
        >
          {datasetTag == 'deep' ?
            <PiMicroscopeFill className="text-3xl text-white" /> :
            <PiMicroscopeLight className="text-3xl" />}
        </ClickableIcon>

        <ClickableIcon
          label="Hierarki"
          remove={["boost_gt"]}
          add={{ datasetTag: 'tree' }}
          aria-current={datasetTag == 'tree' ? 'page' : 'false'}
          className={`bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12`}
        >
          {datasetTag == 'tree' ?
            <PiTreeViewFill className="text-3xl text-white" /> :
            <PiTreeViewLight className="text-3xl" />}
        </ClickableIcon>
        <ClickableIcon
          label="Grunnord"
          add={{ datasetTag: 'base' }}
          aria-current={datasetTag == 'base' ? 'page' : 'false'}
          className={`bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12`}
        >
          {datasetTag == 'base' ?
            <PiWallFill className="text-3xl text-white" /> :
            <PiWallLight className="text-3xl" />}
        </ClickableIcon>
      </>
      }




      

    </div>
    {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="bg-neutral-700 text-white btn rounded-full shadow-lg h-12 w-12 absolute right-0 bottom-14 m-3 z-[5000] transition-all duration-300 ease-in-out"
          aria-label="Scroll to top"
        >
          <PiCaretUpBold className="text-xl" />
        </button>
      )}
    </>

  )
}