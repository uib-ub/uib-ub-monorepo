import { Skeleton } from "@/components/ui/skeleton"
import { MainShell } from './main-shell'

export default function Loader() {
  return (
    <MainShell>
      <div className="flex flex-col w-full gap-5">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[350px]" />
          <Skeleton className="h-24 max-w-prose" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </MainShell>
  )
}