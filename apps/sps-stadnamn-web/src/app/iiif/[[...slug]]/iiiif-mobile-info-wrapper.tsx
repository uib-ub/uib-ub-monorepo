'use client'
import { useContext } from "react";
import IIIFInfoSection from "./iiif-info-section";
import { GlobalContext } from "@/app/global-provider";


export default function IIIIFMobileInfoWrapper({manifest, neighbours, manifestDataset, showOnMobile}: {manifest: any, neighbours: any, manifestDataset: string, showOnMobile: boolean}) {
    const { isMobile, inputValue } = useContext(GlobalContext);


    if (showOnMobile != isMobile || isMobile && inputValue.current.trim().length > 0) {
        return null;
    }

    return (
        <IIIFInfoSection manifest={manifest} neighbours={neighbours} manifestDataset={manifestDataset}/>
    )
}


