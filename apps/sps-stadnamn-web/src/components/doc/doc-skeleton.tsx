import { getSkeletonLength } from "@/lib/utils"


export default function DocSkeleton() {
    return (
        <div className="w-full h-full flex flex-col gap-4 pt-1 pb-2">
            {/* Dataset title */}
            <div className="h-4 w-40 bg-neutral-900/10 rounded-full animate-pulse mb-1"></div>
            {/* Heading */}
            <div className="h-8 w-48 bg-neutral-900/10 rounded-full animate-pulse mb-2"></div>
            {/* Content */}
            <div className="h-4 w-32 bg-neutral-900/10 rounded-full animate-pulse mb-1"></div>
            <div className="h-4 w-32 bg-neutral-900/10 rounded-full animate-pulse mb-1"></div>
            <div className="h-4 w-40 bg-neutral-900/10 rounded-full animate-pulse"></div>
        </div>
    );
}
