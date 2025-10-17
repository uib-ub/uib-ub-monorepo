import { headers } from "next/headers";
import { userAgent } from "next/server";
import { modes } from "@/config/metadata-config";
import React from "react";
import MapDrawer from "@/components/search/overlay-interface";
import MapWrapper from "@/components/map/map-wrapper";
import DocInfo from "@/components/search/details/doc/doc-info";
import ListExplorer from "@/components/search/list/list-explorer";
import TableExplorer from "@/components/search/table/table-explorer";
import StatusSection from "@/components/search/status-section";
import OverlayInterface from "@/components/search/overlay-interface";
import { PiArrowLeft, PiMapTrifold, PiTableFill } from "react-icons/pi";
import Clickable from "@/components/ui/clickable/clickable";
import { RoundClickable, RoundIconClickable } from "@/components/ui/clickable/round-icon-button";
import TableExplorerWrapper from "@/components/search/table/table-explorer-wrapper";


export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const { q } = params

  return {
    title: q || "Søk",
    description: ""
  }
}


export default async function SearchPage({searchParams}: {searchParams: Promise<{mode?: string}>}) {
  const params = await searchParams
  const { mode } = params



  return <main id="main" className="bg-neutral-100 w-full h-full">

    <OverlayInterface />
    <div className={`absolute xl:top-2 left-0 xl:left-[25svw] z-[7000] ${(mode == 'map' || !mode) ? '' : 'max-h-[calc(100svh-3rem)] max-w-[calc(100svw-25svw-0.5rem)] overflow-auto bg-white rounded-md !m-0 h-full w-full stable-scrollbar'}`}>
      {mode == 'table' && <div className="flex items-baseline gap-4 px-4 p-2"><h2 className="text-xl !m-0 !p-0">Kjeldetabell</h2><Clickable className="flex items-center gap-1" remove={['mode']} add={{mode: 'map'}}><PiMapTrifold /> Vis Kart</Clickable></div>}
      {mode != 'table' && <StatusSection />}
      {mode == 'table' && <TableExplorerWrapper />}
      {mode == 'list' && <ListExplorer />}
    </div>

    

    {(!mode || mode == 'map' ) && <MapWrapper />}
  </main>







}

