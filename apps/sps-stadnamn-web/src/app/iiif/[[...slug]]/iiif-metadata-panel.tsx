'use client'
import IconButton from "@/components/ui/icon-button"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"
import { PiArchive, PiArrowLeft, PiCopyright, PiCopyrightFill, PiInfo, PiInfoFill, PiTreeView, PiTreeViewFill } from "react-icons/pi"
import { resolveLanguage } from "./iiif-utils"
import { useState, useEffect } from 'react'

export default function IIIFMetadataPanel({ manifest }: { manifest: any }) {


    return <div className='flex flex-col'>
                {manifest ?
                <>
                
                        <h1>{resolveLanguage(manifest.label)}</h1>
                        {manifest.summary && <p>{resolveLanguage(manifest.summary)}</p>}
                        <ul className="text-base !px-0">
                    {manifest?.metadata?.filter((item: Record<string, any>) => 
                        item.label?.no?.[0] != 'Skannede sedler'
                    ).map((item: Record<string, any>, index: number) => (
                        <li key={index} className='flex flex-col'>
                            <span className='font-semibold'>
                                {resolveLanguage(item.label)}
                            </span>
                            <span>{resolveLanguage(item.value)}</span>
                            </li>
                            ))}
                        </ul>



                </>
                :
                <div className="flex flex-col h-full">
                    <h1>Arkivressurser</h1>
                    <p>Digitalisert arkivmateriale som så langt det er mulig er delt inn og sortert i tråd med det fysiske materialet.</p>
                    <p>I tilfeller der vi har brukt mer enn én inndeling, vil de samme sedlene kunne finner i to forskjellige underinndelinger.</p>
                </div>
                }
                
            </div>
    
}
