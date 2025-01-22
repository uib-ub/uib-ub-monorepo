import { useContext, useEffect, useState } from 'react';
import { infoPageRenderers } from '@/config/info-renderers';
import { DocContext } from '@/app/doc-provider';

interface EtymologyProps {
    etymologyDataset: string;
    uuids: string[];
}

export default function Etymology({ etymologyDataset, uuids }: EtymologyProps) {
    const [etymology, setEtymology] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { docLoading } = useContext(DocContext);

    const leks_etymology = infoPageRenderers['leks_etymology']

    useEffect(() => {


            setLoading(true);
            fetch("/api/etymology", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uuids, etymologyDataset })
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                const hits = data.hits?.hits || [];
                if (hits.length > 0) {
                    const htmlContent = hits[0].fields['content.html'][0];
                    setEtymology(htmlContent);
                } else {
                    setEtymology(null);
                }
            })
            .finally(() => {
                setLoading(false);
            });
        
    }, [JSON.stringify(uuids)]);

    return (
        <div>
            {loading ? (
                <div className="w-full h-full flex flex-col gap-4">
                    <div className="h-4 w-full bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-neutral-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-neutral-200 rounded-full animate-pulse"></div>
                </div>
            ) : (
                etymology && leks_etymology(etymology)
            )}
        </div>
    );
}
