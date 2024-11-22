import SearchProvider from "@/app/map-search-provider";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "./mobile-layout";
import DesktopLayout from "./desktop-layout";

export default async function UserAgentLayout() {

  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'



  return <SearchProvider>
          {isMobile  ? <MobileLayout/> : <DesktopLayout/>}
        </SearchProvider>
}

