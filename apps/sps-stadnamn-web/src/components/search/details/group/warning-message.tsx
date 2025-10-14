import { PiWarning, PiX } from "react-icons/pi";
import { useDismissedMessagesStore } from "@/state/zustand/persistent-warning-store";

interface WarningMessageProps {
    message: string;
    messageId: string;
}

export default function WarningMessage({ 
    message, 
    messageId
}: WarningMessageProps) {
    const { isMessageDismissed, dismissMessage } = useDismissedMessagesStore();
    
    if (isMessageDismissed(messageId)) {
        return null;
    }
    
    return (
        <div className="mb-3 mt-1 text-primary-900 bg-primary-50 p-1 px-2 rounded-md relative">
            <PiWarning className="inline text-primary-800 mr-1" aria-hidden="true" />
            {message}
            <button 
                type="button" 
                className="absolute top-1 right-1"
                onClick={() => dismissMessage(messageId)}
                aria-label="Lukk advarsel"
            >
                <PiX className="text-primary-900 text-lg mr-0.5 align-middle transition-transform" />
            </button>
        </div>
    );
}
