export function ResultItemSkeleton() {
    return (
        <div className="h-14 w-full p-3 flex flex-col flex-grow justify-center gap-1 divide-y divide-neutral-300">
            <div
                className="bg-neutral-900/10 rounded-full h-4 animate-pulse"
                style={{ width: "10rem" }}
            ></div>
            <div
                className="bg-neutral-900/10 rounded-full h-4 animate-pulse"
                style={{ width: "16rem" }}
            ></div>
        </div>
    );
}

export function ResultCardSkeleton({ hasIiif }: { hasIiif?: boolean }) {
    return (
        <div className="relative flex min-w-0 flex-col gap-3 pt-2 pb-4">
            <div className="min-w-0 w-full flex flex-col px-3 gap-3">
                <div className="bg-neutral-900/10 rounded-full h-3 w-32 animate-pulse" />
                <div className="flex flex-col gap-1">
                    <div className="bg-neutral-900/10 rounded-full h-6 w-40 animate-pulse" />
                    <div className="bg-neutral-900/10 rounded-full h-4 w-28 animate-pulse" />
                </div>
            </div>
            {hasIiif && (
                <div className="mt-2">
                    <div className="w-full bg-neutral-900/10 rounded-md h-40 animate-pulse" />
                </div>
            )}
        </div>
    );
}

export default ResultItemSkeleton;

