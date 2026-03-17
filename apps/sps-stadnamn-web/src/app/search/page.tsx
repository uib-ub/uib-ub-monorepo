import { headers } from "next/headers";
import { userAgent } from "next/server";
import MapWrapper from "@/components/map/map-wrapper";
import MapInterface from "./map-interface";
import TableExplorerWrapper from "@/components/table/table-explorer-wrapper";
import { MAP_DRAWER_BOTTOM_HEIGHT_REM } from "@/lib/map-utils";


export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const { q } = params

  return {
    title: q || "Søk",
    robots: {
      index: false,
      follow: false
    }
  }
}


export default async function SearchPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams
  const { mode } = params
  const headersList = await headers()
  const device = userAgent({ headers: headersList }).device
  const isMobile = device.type === 'mobile' || device.type === 'tablet'



  return <main id="main" className="bg-neutral-100 w-full h-full">

    <MapInterface />
    {mode == 'table' &&
      <div style={{ paddingBottom: isMobile ? `${MAP_DRAWER_BOTTOM_HEIGHT_REM * 2}rem` : '0rem' }} className={`absolute left-0 top-14 lg:top-1 xl:left-[25svw] border-t-neutral border-t-2 pt-2 max-h-[calc(100svh-3rem)] xl:max-w-[calc(100svw-25svw-0.5rem)] overflow-auto bg-white xl:rounded-md !m-0 w-full stable-scrollbar`}>
        <TableExplorerWrapper />
      </div>
    }

    {(!mode || mode == 'map') && <MapWrapper />}
  </main>







}

