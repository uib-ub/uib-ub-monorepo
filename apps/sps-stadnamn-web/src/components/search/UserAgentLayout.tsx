import SearchProvider from "@/app/simple-search-provider";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "./MobileLayout";
import DesktopLayout from "./DesktopLayout";

export default function UserAgentLayout() {

  const device = userAgent({headers: headers()}).device
  const isMobile = device.type === 'mobile'



  return <SearchProvider>
    {isMobile ? <MobileLayout/> : <DesktopLayout/>}
  </SearchProvider>
}

