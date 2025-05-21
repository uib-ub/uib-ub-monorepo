import { PiQuestionFill } from "react-icons/pi";
import { useId } from "react";

export default function InfoPopover({ children }: { children?: React.ReactNode }) {
    const id = useId();
    const anchorName = `--anchor-${id}`;
    const popoverId = `info-popover-${id}`;

    return (
        <>
            <button
                popoverTarget={popoverId}
                style={{ ['anchorName' as any]: anchorName }}
                className="inline ml-1 text-primary-600"
                aria-label="More information"
            >
                <PiQuestionFill />
            </button>
            <div
                id={popoverId}
                popover="auto"
                // @ts-expect-error: anchor is not yet in React's type definitions
                anchor={anchorName}
                className="absolute p-4 rounded-md shadow-md bg-white border border-neutral-200 max-w-xs"
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
