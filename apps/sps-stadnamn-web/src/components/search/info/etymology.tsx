import { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { infoPageRenderers } from '@/config/info-renderers';
import { DocContext } from '@/app/doc-provider';
import { datasetTitles } from '@/config/metadata-config';
import { PiCaretRight, PiFiles, PiMagnifyingGlass } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';


interface EtymologyProps {
    etymologyDataset: string;
    uuids: string[];
}

function stripHtmlAndLimitText(html: string) {
    const maxLength = 200;
    const truncateThreshold = 300;
    
    // Add closing tags for any unclosed tags
    const openTags: string[] = [];
    let pos = 0;
    let cleanHtml = html;

    // Find all unclosed tags
    while (pos < cleanHtml.length) {
        const openIndex = cleanHtml.indexOf('<', pos);
        if (openIndex === -1) break;
        
        const closeIndex = cleanHtml.indexOf('>', openIndex);
        if (closeIndex === -1) break;

        const tag = cleanHtml.slice(openIndex, closeIndex + 1);
        
        if (tag.startsWith('</')) {
            // Closing tag - remove matching open tag
            const tagName = tag.slice(2, -1);
            const lastIndex = openTags.lastIndexOf(tagName);
            if (lastIndex !== -1) {
                openTags.splice(lastIndex, 1);
            }
        } else if (!tag.endsWith('/>')) {
            // Opening tag - add to stack
            const tagName = tag.match(/<([a-zA-Z0-9]+)/)?.[1];
            if (tagName) openTags.push(tagName);
        }
        
        pos = closeIndex + 1;
    }

    // Add closing tags in reverse order
    const isTruncated = cleanHtml.length > truncateThreshold;
    if (isTruncated) {
        const lastSpace = cleanHtml.lastIndexOf(' ', maxLength);
        cleanHtml = cleanHtml.slice(0, lastSpace) + '...';
    }

    cleanHtml += openTags.reverse().map(tag => `</${tag}>`).join('');

    return {
        html: cleanHtml,
        isTruncated
    };
}

export default function Etymology({ etymologyDataset, uuids }: EtymologyProps) {
    const searchParams = useSearchParams();
    const [etymology, setEtymology] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const uuidRef = useRef(uuids);
    const [ sourceDocUuid, setSourceDocUuid ] = useState<string | null>(null)
    const doc = searchParams.get('doc')

    const etymology_renderer = infoPageRenderers["leks_etymology"]


    useEffect(() => {
        setLoading(true);
        console.log("FETCHING")
        fetch("/api/etymology", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uuids: uuidRef.current, etymologyDataset })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            const hits = data.hits?.hits || [];
            if (hits.length > 0) {
                const htmlContent = hits[0].fields['content.html'][0];
                setEtymology(htmlContent);
                setSourceDocUuid(hits[0].fields['uuid'][0])
            } else {
                setEtymology(null);
            }
        })
        .finally(() => {
            setLoading(false);
        });
    }, [uuidRef, etymologyDataset]);

    const EtymologyContent = () => {
        if (!etymology) return null;
        const { html, isTruncated } = stripHtmlAndLimitText(etymology);

        const logTouchEvent = (e: React.TouchEvent, name: string) => {
            console.log(`Touch event '${name}' on:`, e.currentTarget);
            console.log('Event propagation path:', e.nativeEvent.composedPath());
        };

        return <div>
            <p>This is a test paragraph</p>
                        <div>This is a test div</div>
            <span>This is a test span</span>
        </div>

        
        return  (
            <div 
                className="p-2" 
                onTouchStart={(e) => logTouchEvent(e, 'outer div')}
            >
                <div 
                    className="flex flex-wrap items-center gap-2"
                    onTouchStart={(e) => logTouchEvent(e, 'flex container')}
                >
                    {false && <div className="inline">{etymology_renderer?.(html)}</div>}
                    <div 
                        className="inline"
                        onTouchStart={(e) => logTouchEvent(e, 'content div')}
                    >
                        <p>This is a test paragraph</p>
                        <div>This is a test div</div>
                        <span>This is a test span</span>
                    </div>
                    
                    <Clickable
                        link
                        add={{doc: sourceDocUuid, parent: doc}}
                        className="no-underline flex items-center gap-1 font-semibold">
                        {isTruncated ? <>Les meir i {datasetTitles[etymologyDataset]}<PiCaretRight aria-hidden="true" className="text-primary-600"/></> 
                        : <>{datasetTitles[etymologyDataset]} <PiCaretRight aria-hidden="true" className="text-primary-600"/></>}
                    </Clickable>
                </div>
            </div>
        );
    };    

    const { html, isTruncated } = etymology ? stripHtmlAndLimitText(etymology) : { html: '', isTruncated: false };

    return (
        <div>
            {loading ? (
                <div className="w-full h-full flex flex-col gap-4 inner-slate p-2">
                    <div className="h-3 w-full bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-2/3 bg-neutral-200 rounded-full animate-pulse"></div>
                </div>
            ) : etymology && (
                <div className="p-2 inner-slate">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline">
                            {etymology_renderer?.(html)}
                        </div>
                        <Clickable
                            link
                            add={{doc: sourceDocUuid, parent: doc}}
                            className="no-underline flex items-center gap-1 font-semibold">
                            {isTruncated 
                                ? <>Les meir i {datasetTitles[etymologyDataset]}<PiCaretRight aria-hidden="true" className="text-primary-600"/></> 
                                : <>{datasetTitles[etymologyDataset]} <PiCaretRight aria-hidden="true" className="text-primary-600"/></>}
                        </Clickable>
                    </div>
                </div>
            )}
        </div>
    );
}
