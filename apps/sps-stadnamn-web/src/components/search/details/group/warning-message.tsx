import { useWarningStore } from "@/state/zustand/warning-store";
import { useEffect, useRef, useState } from "react";
import { PiWarning, PiX } from "react-icons/pi";

interface WarningMessageProps {
    message: string;
    messageId: string;
}

export default function WarningMessage({ 
    message, 
    messageId
}: WarningMessageProps) {
    const { allowMessage, dismissMessage, markShown } = useWarningStore();
    const [shouldRender, setShouldRender] = useState(false);
    const claimedRef = useRef(false);

    // Show only once per session: the first instance claims the messageId
    // and keeps rendering even after markShown updates the store.
    useEffect(() => {
        // StrictMode-safe: claim once and keep rendering this instance
        if (!claimedRef.current && allowMessage(messageId)) {
            claimedRef.current = true;
            setShouldRender(true);
            markShown(messageId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageId]);

    if (!shouldRender) {
        return null;
    }

    

    
    return (
        <div className="mb-3 mt-1 text-primary-900 bg-primary-50 p-1 px-2 rounded-md relative">
            
            <div className="max-w-[calc(100%-2rem)]"><PiWarning className="inline text-primary-800 mr-1" aria-hidden="true" />{message}</div>
            <button 
                type="button" 
                className="absolute top-1 right-1"
                onClick={() => {
                    dismissMessage(messageId);
                    setShouldRender(false);
                }}
                aria-label="Lukk advarsel"
            >
                <PiX className="text-primary-900 text-2xl align-middle transition-transform" aria-hidden="true"/>
            </button>
        </div>
    );
}
