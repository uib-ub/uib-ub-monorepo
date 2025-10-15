import { PiWarning, PiX } from "react-icons/pi";
import { useWarningSessionStore, useWarningStore } from "@/state/zustand/warning-store";

interface WarningMessageProps {
    message: string;
    messageId: string;
}

export default function WarningMessage({ 
    message, 
    messageId
}: WarningMessageProps) {
    const { isMessageDismissed, dismissMessage } = useWarningStore();
    const { hasBeenShownThisSession, markShown } = useWarningSessionStore();
    
    if (hasBeenShownThisSession(messageId)) {
        return null;
    }

    if (isMessageDismissed(messageId)) {
        return null;
    }

    markShown(messageId);
    
    return (
        <div className="mb-3 mt-1 text-primary-900 bg-primary-50 p-1 px-2 rounded-md relative">
            
            <div className="max-w-[calc(100%-2rem)]"><PiWarning className="inline text-primary-800 mr-1" aria-hidden="true" />{message}</div>
            <button 
                type="button" 
                className="absolute top-1 right-1"
                onClick={() => dismissMessage(messageId)}
                aria-label="Lukk advarsel"
            >
                <PiX className="text-primary-900 text-2xl align-middle transition-transform" aria-hidden="true"/>
            </button>
        </div>
    );
}
