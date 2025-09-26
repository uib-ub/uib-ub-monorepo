
import IIIFMetadataPanel from "./iiif-metadata-panel";
import { PiArchiveFill, PiArticle, PiBank, PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRightBold, PiCaretLineRightDuotone, PiCaretRightBold, PiFile, PiSpeakerHigh } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";
import IIIFExpandSummary from "./iiif-expand-summary";
 
import Link from "next/link";

export default function IIIFInfoSection({manifest, manifestDataset, stats}: {manifest: any, manifestDataset: string, stats: any}) {



    return <div className={`flex-1 flex flex-col gap-2 p-4 pb-24 w-full`}>

                <h1>{manifest ? resolveLanguage(manifest.label) : 'Arkiv'}</h1>
                {manifest?.collections?.length > 0 && (
                    (() => {
						const collections = manifest.collections as any[];
						const institution = collections?.[collections.length - 1];
						const levelBelowInstitution = collections?.[collections.length - 2];
                        return (
							<div className="flex flex-col gap-1 text-lg">
                                {institution ? (
                                    <Link key={institution.uuid + '-institution'} href={`/iiif/${institution.uuid}`} className="no-underline truncate flex items-center gap-1">
                                        <PiBank className="text-neutral-700" aria-hidden="true"/>
                                        {resolveLanguage(institution.label)}
                                    </Link>
                                ) : null}
								{levelBelowInstitution && levelBelowInstitution?.uuid !== institution?.uuid ? (
									<Link key={levelBelowInstitution.uuid + '-below-institution'} href={`/iiif/${levelBelowInstitution.uuid}`} className="no-underline truncate flex items-center gap-1">
										<PiArchiveFill className="text-neutral-700" aria-hidden="true"/>
										{resolveLanguage(levelBelowInstitution.label)}
									</Link>
								) : null}
                            </div>
                        );
                    })()
                )}
            <div id="iiif-info-collapsible" className="flex flex-col gap-6">
                {manifest?.summary?.length > 0 && 
                    <div>
                        {resolveLanguage(manifest.summary).length > 150 ?
                        <>
                            {resolveLanguage(manifest.summary).split(' ').slice(0, 20).join(' ')}
                            <IIIFExpandSummary summary={resolveLanguage(manifest.summary)}/>
                        </>
                        :
                            resolveLanguage(manifest.summary)
                        }
                    </div>
                }
                {!manifest && <p>Digitalisert arkivmateriale ordna etter opphavsinstitusjon. Ordninga gjeld det digitaliserte materialet, eksempelvis med mappestrukturer frå dokumentasjonsprosjektet, men vi har så langt det er mogleg lenka til metadata for det fysiske materialet i arkivportalen.</p>}
                
                <IIIFMetadataPanel manifest={manifest} manifestDataset={manifestDataset}/>

                {/* Show stats for collections or when there's no manifest (top level) */}
                {(stats || manifest?.childCount) && (manifest?.type != 'Manifest' || !manifest) && (
                    <ul className="text-base !p-0">
                        <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Visningssider</span>
                            <span className="flex items-center gap-1">
                                <PiFile aria-hidden="true"/>
                                {(stats?.manifests ?? manifest?.childCount?.manifests)?.toLocaleString?.('no-NO') || 0}
                            </span>
                        </li>
                        {(stats?.images || stats?.reusedImages || manifest?.childCount?.images || manifest?.childCount?.reusedImages) ? <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Skannede sider</span>
                            <span className="flex items-center gap-1">
                                <PiArticle aria-hidden="true"/>
                                {(stats?.images ?? manifest?.childCount?.images)
                                    ? (stats?.images ?? manifest?.childCount?.images)?.toLocaleString('no-NO')
                                    : <>{(stats?.reusedImages ?? manifest?.childCount?.reusedImages)?.toLocaleString('no-NO')} (gjenbrukte)</>}
                            </span>
                        </li> : null}
                        
                        {(stats?.audio ?? manifest?.childCount?.audio) ? <li className='flex flex-col'>
                            <span className='font-semibold text-neutral-800'>Lydopptak</span>
                            <span className="flex items-center gap-1">
                                <PiSpeakerHigh aria-hidden="true"/>
                                {(stats?.audio ?? manifest?.childCount?.audio)?.toLocaleString('no-NO') || 0}
                            </span>
                        </li> : null}
                    </ul>
                )}
            </div>
            </div>
}
