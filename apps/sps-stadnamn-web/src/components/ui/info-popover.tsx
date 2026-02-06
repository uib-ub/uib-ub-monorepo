import { useId } from "react";
import { PiQuestionFill } from "react-icons/pi";

export default function InfoPopover({ children }: { children?: React.ReactNode }) {
    const id = useId();
    const anchorName = `--anchor-${id}`;
    const popoverId = `info-popover-${id}`;

    return (
        <>
            <button
                popoverTarget={popoverId}
                type="button"
                style={{ ['anchorName' as any]: anchorName }}
                className="inline ml-1 text-primary-700"
                aria-label="Merknad"
            >
                <PiQuestionFill />
            </button>
            <div
                id={popoverId}
                popover="auto"
                // @ts-expect-error: anchor is not yet in React's type definitions
                anchor={anchorName}
                className="absolute p-4 rounded-md shadow-md bg-white border border-neutral-200 max-w-xs text-base"
                style={{
                    top: "anchor(bottom)",
                    left: "anchor(center)",
                    transform: "translateX(-50%)",
                    marginTop: "0.5rem",
                }}
            >
                {children}
            </div>
        </>
    );
}
