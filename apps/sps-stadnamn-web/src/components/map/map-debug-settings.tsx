"use client";

import { useDebugStore } from "@/state/zustand/debug-store";
import { useRouter, useSearchParams } from "next/navigation";



export default function MapDebugSettings() {
  const showGeotileGrid = useDebugStore((s: any) => s.showGeotileGrid);
  const toggleGeotileGrid = useDebugStore((s: any) => s.toggleGeotileGrid);
  const showMarkerBounds = useDebugStore((s: any) => s.showMarkerBounds);
  const toggleMarkerBounds = useDebugStore((s: any) => s.toggleMarkerBounds);
  const showH3Grid = useDebugStore((s: any) => s.showH3Grid);
  const setShowH3Grid = useDebugStore((s: any) => s.setShowH3Grid);
  const h3Resolution = useDebugStore((s: any) => s.h3Resolution);
  const setH3Resolution = useDebugStore((s: any) => s.setH3Resolution);
  const showScore = useDebugStore((s: any) => s.showScore);
  const setShowScore = useDebugStore((s: any) => s.setShowScore)
  const router = useRouter();
  const showDebugGroups = useDebugStore((s: any) => s.showDebugGroups);
  const setShowDebugGroups = useDebugStore((s: any) => s.setShowDebugGroups);
  const showTop3H3Counts = useDebugStore((s: any) => s.showTop3H3Counts);
  const setShowTop3H3Counts = useDebugStore((s: any) => s.setShowTop3H3Counts);
  const showTop3UUIDCounts = useDebugStore((s: any) => s.showTop3UUIDCounts);
  const setShowTop3UUIDCounts = useDebugStore((s: any) => s.setShowTop3UUIDCounts);
  const searchParams = useSearchParams();

  return (
    <section>
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-base font-semibold text-neutral-900 p-3 flex justify-between items-center">
          Debug
          {/* Button to disable debug */}
          <button
            type="button"
            className="ml-4 px-3 py-1 text-sm rounded bg-neutral-200 text-neutral-900 hover:bg-neutral-300 transition-colors"
            onClick={() => {
              useDebugStore.getInitialState();
              useDebugStore.persist.clearStorage(); 
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('debug');
              router.push(`?${newParams.toString()}`)
              window.location.reload();
            
            }
            }
          >
            Slå av debug
          </button>
        </legend>
        <div className="flex flex-col gap-2 px-2 py-1">
            <div className="flex flex-col gap-2 mt-2">
              <fieldset className="border-0 p-0 m-0">
                <legend className="text-base font-semibold text-neutral-900 p-3">H3 oppløysing</legend>
                <div className="flex items-center gap-2 px-2 py-1">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={h3Resolution}
                    onChange={(e) => setH3Resolution(Number(e.target.value))}
                    className="accent-accent-800"
                    id="h3-resolution-slider"
                  />
                  <label htmlFor="h3-resolution-slider" className="whitespace-nowrap">
                    {h3Resolution}
                  </label>
                </div>
              </fieldset>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGeotileGrid}
                  onChange={toggleGeotileGrid}
                  className="accent-accent-800"
                />
                <span>Vis geotile grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMarkerBounds}
                  onChange={toggleMarkerBounds}
                  className="accent-accent-800"
                />
                <span>Vis marker bounds</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showH3Grid}
                  onChange={() => setShowH3Grid(!showH3Grid)}
                  className="accent-accent-800"
                />
                <span>Vis H3 grid</span>
              </label>

              {/* Separate section for debug groups */}
              <fieldset className="border-0 p-0 m-0 mt-3">
                <legend className="text-base font-semibold text-neutral-900 p-3">Debug grupper</legend>
                <div className="flex flex-col gap-2 px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDebugGroups}
                      onChange={() => setShowDebugGroups(!showDebugGroups)}
                      className="accent-accent-800"
                    />
                    <span>Debugging av grupper</span>
                  </label>
                </div>
                <div className="flex flex-col gap-2 px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTop3H3Counts}
                      onChange={() => setShowTop3H3Counts(!showTop3H3Counts)}
                      className="accent-accent-800"
                    />
                    <span>Vis top 3 H3-antall</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTop3UUIDCounts}
                      onChange={() => setShowTop3UUIDCounts(!showTop3UUIDCounts)}
                      className="accent-accent-800"
                    />
                    <span>Vis top 3 UUID-antall</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="border-0 p-0 m-0">
                <legend className="text-base font-semibold text-neutral-900 p-3">Score</legend>
                <div className="flex flex-col gap-2 px-2 py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScore}
                      onChange={() => setShowScore(!showScore)}
                      className="accent-accent-800"
                    />
                    <span>Vis score</span>
                  </label>
                </div>
              </fieldset>
            </div>
        </div>
      </fieldset>
    

    </section>
  );
}


