import SearchProvider from "@/app/search-provider";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "@/components/search/mobile-layout";
import DesktopLayout from "@/components/search/desktop-layout";
import DocProvider from "@/app/doc-provider";
import ChildrenProvider from "../children-provider";

export default async function SearchPage() {
  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'
  
  return <SearchProvider>
          <DocProvider>
            <ChildrenProvider>
              {isMobile  ? <MobileLayout/> : <DesktopLayout/>}
            </ChildrenProvider>
          </DocProvider>
        </SearchProvider>
}

