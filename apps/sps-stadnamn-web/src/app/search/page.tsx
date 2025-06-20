import SearchProvider from "@/app/search-provider";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "@/components/search/mobile-layout";
import DesktopLayout from "@/components/search/desktop-layout";
import DocProvider from "@/app/doc-provider";
import ChildrenProvider from "../children-provider";
import { datasetTitles, datasetShortDescriptions } from "@/config/metadata-config";
import GroupProvider from "../group-provider";

export async function generateMetadata({searchParams}: {searchParams: Promise<{dataset: string}>}) {
  const { dataset } = await searchParams
  return {
    title: datasetTitles[dataset || 'search'],
    description: datasetShortDescriptions[dataset || 'search']
  }
}

export default async function SearchPage() {
  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'
  
  return <SearchProvider>
          <DocProvider>
            <ChildrenProvider>
              <GroupProvider>
                {isMobile  ? <MobileLayout/> : <DesktopLayout/>}
              </GroupProvider>
            </ChildrenProvider>
          </DocProvider>
        </SearchProvider>
}

