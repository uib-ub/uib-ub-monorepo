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
    // Remove HTML tags using regex
    const text = html.replace(/<[^>]*>/g, '');

    const maxLength = 200;
    
    // Check if text needs truncation
    const isTruncated = text.length > maxLength;
    const truncatedText = isTruncated 
        ? text.substring(0, maxLength).trim() + '...'
        : text;

    return {
        text: truncatedText,
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
        const { text, isTruncated } = stripHtmlAndLimitText(etymology);
        return (
            <div>
                <div>{text}</div>
                
                    <Clickable
                        link
                        add={{doc: sourceDocUuid, parent: doc}}
                        className="no-underline flex items-center gap-1"
                    >
                        {isTruncated ? <>Les meir i {datasetTitles[etymologyDataset]}<PiCaretRight aria-hidden="true" className="text-primary-600"/></> 
                        : <><PiFiles aria-hidden="true" className="text-primary-600"/>Kjelde: {datasetTitles[etymologyDataset]}</>}
                        
                    </Clickable>
            </div>
        );
    };

    return (
        <div>
            {loading ? (
                <div className="w-full h-full flex flex-col gap-4">
                    <div className="h-4 w-full bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-neutral-200 rounded-full animate-pulse"></div>
                </div>
            ) : (
                <EtymologyContent/>
            )}
        </div>
    );
}
