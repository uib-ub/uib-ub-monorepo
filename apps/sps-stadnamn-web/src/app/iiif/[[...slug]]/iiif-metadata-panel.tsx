'use client'
import IconButton from "@/components/ui/icon-button"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"
import { PiArchive, PiArrowLeft, PiArticle, PiArticleFill, PiCopyright, PiCopyrightFill, PiFile, PiFileAudio, PiFileFill, PiImage, PiInfo, PiInfoFill, PiSpeakerHigh, PiSpeakerLow, PiTreeView, PiTreeViewFill } from "react-icons/pi"
import { resolveLanguage } from "../iiif-utils"
import { datasetPresentation } from "@/config/metadata-config"
import Image from "next/image"
import { useState, useEffect } from 'react'

const addLinks = (text: string | any) => {
    const textString = String(text);
    // Match HTML anchor tags with their content
    const regex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const parts = textString.split(regex);
    
    const result = [];
    for (let i = 0; i < parts.length; i++) {
        if (i % 3 === 0) {
            // Regular text
            if (parts[i]) result.push(<span key={`text-${i}`}>{parts[i]}</span>);
        } else if (i % 3 === 1) {
            // URL (parts[i]) and link text (parts[i+1])
            const url = parts[i];
            const linkText = parts[i + 1];
            result.push(
                <Link 
                    key={`link-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer">
                    {linkText}
                </Link>
            );
            i++; // Skip the next part since we've used it
        }
    }
    
    return result;
}

export default function IIIFMetadataPanel({ manifest, manifestDataset }: { manifest: any, manifestDataset: string }) {



    return <div className='flex flex-col pb-12 gap-4'>
        
        {manifest ?
                <>
                
                {datasetPresentation[manifestDataset]?.license?.url && <Link href={datasetPresentation[manifestDataset]?.license?.url} className="flex items-center gap-1 text-neutral-900 font-semibold mb-2 no-underline">
                    <PiCopyright aria-hidden="true" />
                    <span className="text-sm">Lisens: {datasetPresentation[manifestDataset]?.license?.name}</span>
                </Link>}
                

        
                
                        
                        <ul className="text-base !px-0">
                    {manifest?.metadata?.map((item: Record<string, any>, index: number) => (
                        <li key={index} className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>
                                {resolveLanguage(item.label)}
                            </span>
                            <span>{addLinks(resolveLanguage(item.value))}</span>
                            </li>
                            ))}

                {manifest.childCount && <>
                    
                    <li className='flex flex-col'>
                        <span className='font-semibold text-neutral-800'>
                            Elementer
                        </span>
                        <span className="flex items-center gap-1">
                        <PiFile aria-hidden="true" className="text-neutral-800" />
                            {manifest.childCount.manifests?.toLocaleString('no-NO')}</span>
                    </li>
                    {manifest.childCount.images && <li className='flex flex-col'>
                        <span className='font-semibold text-neutral-800'>
                            Skannede sider
                        </span>
                        <span className="flex items-center gap-1">
                            <PiArticle aria-hidden="true" className="text-neutral-800" />
                            {manifest.childCount.images?.toLocaleString('no-NO')}</span>
                    </li>}
                    {manifest.childCount.audio && <li className='flex flex-col'>
                        <span className='font-semibold text-neutral-800'>
                            Lydopptak
                        </span>
                        <span className="flex items-center gap-1">
                            <PiSpeakerHigh aria-hidden="true" className="text-neutral-800" />
                            {manifest.childCount.audio?.toLocaleString('no-NO')}</span>
                    </li>}
                            </>}


                    {manifest.alternativeManifests &&
                        <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>
                                Andre visninger
                            </span>
                            {manifest.alternativeManifests.map((item: any, index: number) => (
                                <span key={index}><Link href={`/iiif/${item.uuid}`}>{resolveLanguage(item.label)}</Link></span>
                            ))}
                        </li>
                    }
                
                </ul>
                <Link href={`/iiif/${manifest.type.toLowerCase()}/${manifest.uuid}`} className="text-sm flex items-center gap-1 no-underline">
                <Image src="https://iiif.io/favicon.ico" alt="IIIF" width={16} height={16} />
                    <span>
                        Standardiserte metadata (IIIF)
                    </span>
                </Link>



                        





                </>
                :
                null
                }
                
            </div>
    
}
