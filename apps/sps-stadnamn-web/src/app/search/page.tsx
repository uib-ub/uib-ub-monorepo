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
    <div className={`absolute top-14 xl:top-2 left-0 xl:left-[25svw] z-[1000] ${(mode == 'map' || !mode) ? '' : 'max-h-[calc(100svh-3rem)] overflow-auto bg-neutral-50 !m-0 h-full w-full stable-scrollbar'}`}>
      <StatusSection />
      {mode == 'table' && <TableExplorer />}
      {mode == 'list' && <ListExplorer />}
    </div>

    

    {(!mode || mode == 'map' ) && <MapWrapper />}
  </main>







}

