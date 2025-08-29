'use client'
import useSearchData from "@/state/hooks/search-data"
import useStatsData from "@/state/hooks/stats-data"

export default function HomeStats() {

    const { searchLoading, totalHits } = useSearchData()
    const { statsLoading, statsData } = useStatsData()

    const skeleton = () => ( <div aria-hidden="true" className="inline-block">
      <span className="inline-block bg-neutral-900/10 rounded-lg animate-pulse text-transparent">0</span>&nbsp;
      <span className="inline-block bg-neutral-900/10 rounded-lg animate-pulse text-transparent">000</span>&nbsp;
      <span className="inline-block bg-neutral-900/10 rounded-lg animate-pulse text-transparent">000</span>
    </div>
    )

    return <div className="flex flex-row items-end justify-center gap-12">
  <div className="flex flex-col items-center">
    <span className="uppercase text-xs tracking-widest text-neutral-700 mb-2">Oppslag i søket</span>
    <span className="text-3xl font-serif text-neutral-900" style={{ fontVariantNumeric: "tabular-nums" }}>
      {(statsLoading || !statsData) ? skeleton() : (
        statsData.groupCount?.toLocaleString('nb-NO')
      )}
    </span>
  </div>
  <div className="flex flex-col items-center">
    <span className="uppercase text-xs tracking-widest text-neutral-700 mb-2">Underoppslag</span>
    <span className="text-3xl font-serif text-neutral-900" style={{ fontVariantNumeric: "tabular-nums" }}>
      {searchLoading ? skeleton() : (
        totalHits?.value?.toLocaleString('nb-NO')
      )}
    </span>
  </div>
</div>
}