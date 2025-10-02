'use client'
import OverlayInterface from "@/components/search/overlay-interface";

import StatusSection from "@/components/search/status-section"
import DebugList from "./debug-list";
import TableExplorer from "@/components/search/table/table-explorer";
import ListExplorer from "@/components/search/list/list-explorer";
import MapWrapper from "@/components/map/map-wrapper";
import { useMode } from "@/lib/param-hooks";

export default function ClientLayout() {
    const mode = useMode()
    return <>
    <OverlayInterface />
    <div className={`absolute top-14 xl:top-2 left-0 xl:left-[25svw] z-[1000] ${(mode == 'map' || !mode) ? '' : 'max-h-[calc(100svh-3rem)] overflow-auto bg-neutral-50 !m-0 h-full w-full stable-scrollbar'}`}>
      <StatusSection />
      {mode == 'table' && <TableExplorer />}
      {mode == 'list' && <ListExplorer />}
    </div>

    

    

    {(!mode || mode == 'map' ) && <MapWrapper />}
    </>
    
}