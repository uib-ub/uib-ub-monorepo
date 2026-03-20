'use client'
import { useWarningStore } from "@/state/zustand/warning-store";
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { PiInfo, PiWarning, PiX } from "react-icons/pi";

interface InfoMessage extends PropsWithChildren {
    message: string; // The short message if children (details) exist, or the whole message if no children
    messageId: string;
    children?: ReactNode; // The detailed body, optional
}

export default function InfoMessage({
    message,
    messageId,
    children
}: InfoMessage) {
    const { allowMessage, dismissMessage } = useWarningStore();
    const [expanded, setExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const claimedRef = useRef(false);

    // Show only if not dismissed; claim once per session (no auto-hide)
    useEffect(() => {
        setMounted(true);
        if (!claimedRef.current) {
            claimedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageId]);

    // Avoid hydration mismatch: `allowMessage` can differ before/after localStorage is available.
    if (!mounted || !allowMessage(messageId)) {
        return null;
    }

    // If children are present, message is the shortMessage, children is the body
    if (children) {
        return (
            <div className="mb-3 mt-1 text-neutral-900 bg-neutral-50 p-2 px-3 rounded-md relative">
                <div className="flex items-center gap-2 max-w-[calc(100%-2rem)]">
                    <PiInfo className="inline text-neutral-800 mr-1 shrink-0" aria-hidden="true" />
                    <span className="font-medium">{message}</span>
                    <button
                        type="button"
                        className="ml-auto text-sm underline text-neutral-800 hover:text-neutral-900 transition-colors"
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
                    className="absolute top-2 right-2"
                    onClick={() => dismissMessage(messageId)}
                    aria-label="Lukk advarsel"
                >
                    <PiX className="text-neutral-900 text-2xl align-middle transition-transform" aria-hidden="true" />
                </button>
            </div>
        );
    }

    // If no children, always show full message as before
    return (
        <div className="mb-3 mt-1 text-neutral-900 bg-neutral-50 p-2 px-3 rounded-md relative">
            <div className="max-w-[calc(100%-2rem)]">
                <PiInfo className="inline text-neutral-800 mr-1" aria-hidden="true" />
                {message}
            </div>
            <button
                type="button"
                className="absolute top-2 right-2"
                onClick={() => dismissMessage(messageId)}
                aria-label="Lukk advarsel"
            >
                <PiX className="text-neutral-900 text-2xl align-middle transition-transform" aria-hidden="true" />
            </button>
        </div>
    );
}
