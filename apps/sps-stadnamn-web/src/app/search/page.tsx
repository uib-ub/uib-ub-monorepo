import SearchProvider from "@/app/search-provider";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "@/components/search/mobile-layout";
import DesktopLayout from "@/components/search/desktop-layout";
import DocProvider from "@/app/doc-provider";

export default async function UserAgentLayout() {

  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'
  
  
  return <SearchProvider>
          <DocProvider>
            {isMobile  ? <MobileLayout/> : <DesktopLayout/>}
          </DocProvider>
        </SearchProvider>
}

