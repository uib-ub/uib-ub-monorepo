'use client'

import IconButton from "@/components/ui/icon-button"
import IconLink from "@/components/ui/icon-link"
import Link from "next/link"
import { useState } from "react"
import { PiArchive, PiArrowLeft, PiCopyright, PiCopyrightFill, PiInfo, PiInfoFill, PiTreeView, PiTreeViewFill } from "react-icons/pi"

export default function IIIFToolbar({ manifest }: { manifest: any }) {
    const [activeTab, setActiveTab] = useState<string>("info")
    return <div className='flex flex-col h-full'>
            { <div className='flex border-b border-neutral-200 flex-shrink-0'>
                <IconButton label="Informasjon" href="#" 
                          aria-selected={activeTab === "info"}
                          className='p-4 hover:bg-neutral-100 text-gray-600'
                          onClick={() => setActiveTab("info")}>
                    {activeTab === "info" ? <PiInfoFill className="text-xl text-accent-700"/> : <PiInfo className="text-xl"/>}
                </IconButton>
                {manifest?.collections?.length > 0 && <IconButton label="Naviger i samlinga" href="#" 
                          aria-selected={activeTab === "arkiv"}
                          className='p-4 hover:bg-neutral-100 text-gray-600'
                          onClick={() => setActiveTab("arkiv")}>
                    {activeTab === "arkiv" ? <PiTreeViewFill className="text-xl text-accent-700"/> : <PiTreeView className="text-xl"/>}
                </IconButton>}
                <IconButton label="Opphavsrett" href="#" 
                          aria-selected={activeTab === "attribution"}
                          className='p-4 hover:bg-neutral-100 text-gray-600'
                          onClick={() => setActiveTab("attribution")}>
                    {activeTab === "attribution" ? <PiCopyrightFill className="text-xl text-accent-700"/> : <PiCopyright className="text-xl"/>}
                </IconButton>
            </div>}
            <div className='space-y-2 text-sm text-gray-800 p-8 page-info bg-white break-words border-l-2 border-neutral-200 flex-1 overflow-y-auto' style={{ maxHeight: 'calc(100vh - 150px)' }}>
                {manifest ?
                <>
                {activeTab === "info" && (
                    <>
                        <h1>{manifest.label}</h1>
                        {manifest.summary && <p>{manifest.summary}</p>}
                        <ul className="text-base !px-0">
                    {manifest?.metadata?.filter((item: Record<string, any>) => 
                        item.label?.no?.[0] != 'Skannede sedler'
                    ).map((item: Record<string, any>, index: number) => (
                        <li key={index} className='flex flex-col'>
                            <span className='font-semibold'>
                                {item.label}
                            </span>
                            <span>{item.value}</span>
                            </li>
                            ))}
                        </ul>
                    </>
                )}
                {activeTab === "arkiv" && (
                    <div>
                        <h2>Arkiv</h2>
                        <pre>{JSON.stringify(manifest, null, 2)}</pre>
                    </div>
                )}
                {activeTab === "attribution" && (
                    <div>
                        <h2>Attribution</h2>
                    </div>
                )}
                </>
                :
                <div className="flex flex-col h-full">
                    <h1>Arkivressurser</h1>
                    <p>Digitalisert arkivmateriale som så langt det er mulig er delt inn og sortert i tråd med det fysiske materialet.</p>
                    <p>I tilfeller der vi har brukt mer enn én inndeling, vil de samme sedlene kunne finner i to forskjellige underinndelinger.</p>
                </div>
                }
                
            </div>
        </div>
    
}
