'use client'
import IconButton from "@/components/ui/icon-button"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"
import { PiArchive, PiArrowLeft, PiArticle, PiArticleFill, PiCopyright, PiCopyrightFill, PiFile, PiFileFill, PiInfo, PiInfoFill, PiTreeView, PiTreeViewFill } from "react-icons/pi"
import { resolveLanguage } from "./iiif-utils"
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

export default function IIIFMetadataPanel({ manifest }: { manifest: any }) {


    return <div className='flex flex-col pb-12'>
                {manifest ?
                <>
                
                        
                        <ul className="text-base !px-0">
                    {manifest?.metadata?.map((item: Record<string, any>, index: number) => (
                        <li key={index} className='flex flex-col'>
                            <span className='font-semibold'>
                                {resolveLanguage(item.label)}
                            </span>
                            <span>{addLinks(resolveLanguage(item.value))}</span>
                            </li>
                            ))}

                {manifest.childCount && <>
                    
                    <li className='flex flex-col'>
                        <span className='font-semibold'>
                            Dokumenter
                        </span>
                        <span className="flex items-center gap-1">{manifest.childCount.manifests}</span>
                    </li>
                    <li className='flex flex-col'>
                        <span className='font-semibold'>
                            Sedler
                        </span>
                        <span className="flex items-center gap-1">{manifest.childCount.images}</span>
                            </li>
                            
                        </>}

                    {manifest.alternativeManifests &&
                        <li className='flex flex-col'>
                            <span className='font-semibold'>
                                Skanninger
                            </span>
                            {manifest.alternativeManifests.map((item: any, index: number) => (
                                <span key={index}><Link href={`/iiif/${item.uuid}`}>{resolveLanguage(item.label)}</Link></span>
                            ))}
                        </li>
                    }
                
                </ul>

                        





                </>
                :
                null
                }
                
            </div>
    
}
