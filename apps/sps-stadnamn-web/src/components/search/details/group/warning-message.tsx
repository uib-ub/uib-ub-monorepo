import { useWarningStore } from "@/state/zustand/warning-store";
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { PiWarning, PiX } from "react-icons/pi";

interface WarningMessageProps extends PropsWithChildren {
    message: string; // The short message if children (details) exist, or the whole message if no children
    messageId: string;
    children?: ReactNode; // The detailed body, optional
}

export default function WarningMessage({
    message,
    messageId,
    children
}: WarningMessageProps) {
    const { allowMessage, dismissMessage } = useWarningStore();
    const [expanded, setExpanded] = useState(false);
    const claimedRef = useRef(false);

    // Show only if not dismissed; claim once per session (no auto-hide)
    useEffect(() => {
        if (!claimedRef.current) {
            claimedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageId]);

    if (!allowMessage(messageId)) {
        return null;
    }

    // If children are present, message is the shortMessage, children is the body
    if (children) {
        return (
            <div className="mb-3 mt-1 text-primary-900 bg-primary-50 p-1 px-2 rounded-md relative">
                <div className="flex items-center gap-2 max-w-[calc(100%-2rem)]">
                    <PiWarning className="inline text-primary-800 mr-1 shrink-0" aria-hidden="true" />
                    <span className="font-medium">{message}</span>
                    <button
                        type="button"
                        className="ml-auto text-sm underline text-primary-800 hover:text-primary-900 transition-colors"
                        aria-expanded={expanded}
                        aria-controls={`warning-message-details-${messageId}`}
                        onClick={() => setExpanded((prev) => !prev)}
                        tabIndex={0}
                    >
                        {expanded ? "Skjul detaljer" : "Vis detaljer"}
                    </button>
                </div>
                {expanded && (
                    <div className="mt-1 max-w-[calc(100%-2rem)]" id={`warning-message-details-${messageId}`}>
                        {children}
                    </div>
                )}
                <button
                    type="button"
                    className="absolute top-1 right-1"
                    onClick={() => dismissMessage(messageId)}
                    aria-label="Lukk advarsel"
                >
                    <PiX className="text-primary-900 text-2xl align-middle transition-transform" aria-hidden="true" />
                </button>
            </div>
        );
    }

    // If no children, always show full message as before
    return (
        <div className="mb-3 mt-1 text-primary-900 bg-primary-50 p-1 px-2 rounded-md relative">
            <div className="max-w-[calc(100%-2rem)]">
                <PiWarning className="inline text-primary-800 mr-1" aria-hidden="true" />
                {message}
            </div>
            <button
                type="button"
                className="absolute top-1 right-1"
                onClick={() => dismissMessage(messageId)}
                aria-label="Lukk advarsel"
            >
                <PiX className="text-primary-900 text-2xl align-middle transition-transform" aria-hidden="true" />
            </button>
        </div>
    );
}
