import ClientThumbnail from "@/components/doc/client-thumbnail";
import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import { useMemo, useState, type ReactNode } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";
import { resultRenderers } from "@/config/result-renderers";



const TextTab = ({ textItems }: { textItems: any[] }) => {
    return textItems?.map((textItem) => {
        const links = resultRenderers[textItem.dataset]?.links?.(textItem)
        return (
            <div className="py-2" key={textItem.uuid + 'text'}>
                <strong>{datasetTitles[textItem.dataset]}</strong> | {formatHtml(
                    textItem.content.html
                        ? textItem.content.html.replace(/<\/?p>/g, '')
                        : textItem.content.html
                )}
                {links}
            </div>
        )
    })
}


const SourcesTab = ({ datasets }: { datasets: Record<string, any[]> }) => {
    return <>
    FILTRER ETTER DATASETT<br />
    FILTRER ETTER NAMNEFORM<br />
    dynamisk visning: tidslinje øverst, deretter navneformer uten år.
    List opp alle kilder hvis få

    { Object.entries(datasets).map(([dataset, sources]) => (
        <div className="py-2" key={dataset + 'dataset'} >
            <h3>{datasetTitles[dataset]}</h3>
            
            {sources.map((source: any) => (
                <div key={source.uuid + 'source'}>{source.label}</div>
            ))}
        </div>
    ))}
    </>
}

const LocationsTab = ({ locations }: { locations: any[] }) => {
    return locations.map((location: any) => (
        <div key={location.uuid + 'location'}>{location.label}</div>
    ))
}

const TabButton = ({ openTab, setOpenTab, tab, label }: { openTab: string | null, setOpenTab: (tab: string) => void, tab: string, label: string }) => {
    const isActive = openTab === tab
    return (
        <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="pb-2 text-sm"
            onClick={() => setOpenTab(tab)}
            id={`tab-${tab}`}
            aria-controls={`tabpanel-${tab}`}
            type="button"
        >
            <span className={`
                            mx-3 font-semibold border-b-2 transition-colors duration-150 uppercase tracking-wider
                            ${isActive
                    ? 'border-accent-800 text-accent-800'
                    : 'border-transparent text-neutral-800'
                }
                        `}>
                {label}
            </span>
        </button>
    )
}



const TabList = ({ children }: { children: ReactNode }) => {
    return (
        <div
            role="tablist"
            aria-label="Gruppefaner"
            className="flex"
        >
            {children}
        </div>
    )
}


export default function GroupInfo({ overrideGroupCode }: { overrideGroupCode?: string }) {
    const { groupData } = useGroupData(overrideGroupCode)
    const [openTab, setOpenTab] = useState<string | null>(null)

    const { iiifItems, textItems, audioItems, datasets, timelineItems } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const datasets: Record<string, any[]> = {}
        const timelineItems: any[] = []





        groupData?.sources?.forEach((source: any) => {
            if (source.iiif) {
                iiifItems.push(source)
            }
            if (source.content?.html) {
                textItems.push(source)
            }
            if (source.recordings) {
                audioItems.push(source)
            }
            datasets[source.dataset] = datasets[source.dataset] || []
            datasets[source.dataset].push(source)
        })
        if (textItems.length > 0) {
            setOpenTab('text')
        }

        return { iiifItems, textItems, audioItems, datasets, timelineItems }
    }, [groupData])



    return (
        <div className="w-full flex flex-col gap-4 my-2 pb-8">
            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>{JSON.stringify(audioItem)}</div>
                ))
            }
            {iiifItems?.length > 0 && <>
                <Carousel items={iiifItems} />
            </>
            }

            <div className="w-full">
                <TabList>
                    <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="text" label="Tekst" />
                    <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="sources" label="Kjelder" />
                    <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="places" label="Lokalitetar" />
                    
                </TabList>

                <div>

                    <div role="tabpanel" className="px-3" id={`tabpanel-${openTab}`} aria-labelledby={`tab-${openTab}`}>
                        {openTab === 'text' && <TextTab textItems={textItems} />}
                        {openTab === 'sources' && <SourcesTab datasets={datasets} />}
                        {openTab === 'locations' && <LocationsTab locations={[]} />}
                    </div>

                </div>
            </div>


        </div>
    );
}