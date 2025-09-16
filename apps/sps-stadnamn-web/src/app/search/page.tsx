import { headers } from "next/headers";
import { userAgent } from "next/server";
import MobileLayout from "@/components/search/mobile-layout";
import DesktopLayout from "@/components/search/desktop-layout";
import { modes } from "@/config/metadata-config";
import React from "react";

export async function generateMetadata({searchParams}: {searchParams: Promise<{mode: string}>}) {
  const { mode } = await searchParams
  return {
    title: modes[mode || 'map'].title,
    description: modes[mode || 'map'].description
  }
}

export default async function SearchPage() {
  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'

  if (isMobile) {
    return <MobileLayout/>
  }
  else {
    return <DesktopLayout/>
  }
}

