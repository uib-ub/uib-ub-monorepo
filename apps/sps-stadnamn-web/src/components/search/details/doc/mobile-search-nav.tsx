'use client'
import Clickable from '@/components/ui/clickable/clickable'
import ClickableIcon from '@/components/ui/clickable/clickable-icon'
import { useGroup } from '@/lib/param-hooks'
import { stringToBase64Url } from '@/lib/param-utils'
import useCollapsedData from '@/state/hooks/collapsed-data'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { PiBinocularsFill, PiBinocularsLight, PiBookOpenFill, PiBookOpenLight, PiCaretLeftBold, PiCaretUpBold, PiClockFill, PiClockLight, PiDatabaseFill, PiDatabaseLight, PiMicroscopeFill, PiMicroscopeLight, PiSignpostFill, PiSignpostLight, PiTreeViewFill, PiTreeViewLight, PiWallFill, PiWallLight } from 'react-icons/pi'

export default function MobileSearchNav({ currentPosition, drawerContent, showScrollToTop, scrollableContent }: { currentPosition: number, drawerContent: string, showScrollToTop: boolean, scrollableContent: React.RefObject<HTMLDivElement> }) {

  const searchParams = useSearchParams()
  const { collapsedData, collapsedHasNextPage, collapsedFetchNextPage } = useCollapsedData()
  const { activeGroupCode, activeGroupValue } = useGroup()
  const [nextGroup, setNextGroup] = useState<Record<string, any> | null>(null)
  const [prevGroup, setPrevGroup] = useState<Record<string, any> | null>(null)
  const datasetTag = searchParams.get('datasetTag')
  const doc = searchParams.get('doc')
  const details = searchParams.get('details')
  const nav = searchParams.get('nav')

  const { flattenedPages, groupPosition } = useMemo((): { flattenedPages: any[]; groupPosition: number } => {
    const flattenedPages = collapsedData?.pages.flatMap(page => page.data ?? []) ?? [];
    const groupPosition = flattenedPages.findIndex(doc => doc.fields['group.id']?.[0] === activeGroupValue);
    console.log('Group Position:', groupPosition, 'for group:', activeGroupValue);
    return { flattenedPages, groupPosition };
  }, [collapsedData, activeGroupValue]);


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
        {datasetTag != 'tree' && drawerContent == 'details' && doc && <div className="flex gap-1">
          <Clickable remove={['doc']} className="btn btn-outline rounded-full shadow-lg h-12 flex items-center justify-center gap-2">
            <PiCaretLeftBold className="text-xl" aria-hidden="true" />Tilbake
          </Clickable>
        </div>}
        {drawerContent == 'details' && !doc && <>


          {/* Show "Finn namneformer" if group is not grunnord */}
          {activeGroupCode && !activeGroupValue?.startsWith('grunnord') ? <>
            <ClickableIcon label="Oppslag"
              add={{ details: 'group' }}
              aria-current={details == 'group' ? 'page' : 'false'}
              className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
            >
              {details == 'group' ? <PiBookOpenFill className="text-xl" aria-hidden="true" /> : <PiBookOpenLight className="text-xl" aria-hidden="true" />}
            </ClickableIcon>

            <ClickableIcon
              label="Tidslinje"
              remove={['doc']}
              add={{
                group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
                details: 'timeline'
              }}
              aria-current={(details == 'timeline' && !doc) ? 'page' : 'false'}
              className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
            >
              {(details == 'timeline' && !doc) ? <PiClockFill className="text-xl" aria-hidden="true" /> : <PiClockLight className="text-xl" aria-hidden="true" />}
            </ClickableIcon>
            <ClickableIcon
              label="Namn"
              remove={['doc']}
              add={{
                group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
                details: 'names'
              }}
              aria-current={(details == 'names' && !doc) ? 'page' : 'false'}
              className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
            >
              {(details == 'names' && !doc) ? <PiSignpostFill className="text-xl" aria-hidden="true" /> : <PiSignpostLight className="text-xl" aria-hidden="true" />}
            </ClickableIcon>
            <ClickableIcon
              label="Liknande namn"
              remove={['doc']}
              add={{
                group: stringToBase64Url(nextGroup?.fields?.['group.id']?.[0] || ''),
                details: 'overview'
              }}
              aria-current={(details == 'overview' && !doc) ? 'page' : 'false'}
              className="bg-neutral-700 aria-[current=page]:bg-accent-700 text-white btn rounded-full shadow-lg h-12 w-12"
            >
              {(details == 'overview' && !doc) ? <PiBinocularsFill className="text-xl" aria-hidden="true" /> : <PiBinocularsLight className="text-xl" aria-hidden="true" />}
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
            label="Registre"
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
            remove={["dataset"]}
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