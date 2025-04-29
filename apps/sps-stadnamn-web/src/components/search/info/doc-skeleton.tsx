import { getSkeletonLength } from "@/lib/utils"


export default function DocSkeleton() {
    return <div className="w-full h-full flex justify-start flex flex-col gap-4 pt-1 pb-2">
    <div className="h-8 w-32 bg-neutral-200 rounded-full animate-pulse"></div>
    <div className="flex gap-2 pb-2">
        <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
        <div className="h-5 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
    </div>
    {Array.from({length: 4}).map((_, index) => {
        return <div key={index} style={{width: getSkeletonLength(index, 10, 20) + 'rem' }} className="h-4 bg-neutral-200 rounded-full animate-pulse"></div>
    })}
    <div className="flex gap-2 pt-4">
        <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-24 bg-neutral-200 rounded-full animate-pulse"></div>
    </div>


</div>
}
