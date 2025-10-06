'use client'
import { useState } from "react";
import { baseMaps } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import { PiCheckCircleFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import { usePerspective } from "@/lib/param-hooks";
import dynamic from "next/dynamic";

const MapDebugSettings = dynamic(() => import("./map-debug-settings"), { ssr: false });

export default function MapSettings() {
  const { baseMap, markerMode, setBaseMap, setMarkerMode } = useMapSettings();
  const perspective = usePerspective();

  // Add state for h3 resolution

  const markerModes = [
    { key: 'auto', label: 'Automatisk' },
    { key: 'counts', label: 'Klynger' },
    { key: 'labels', label: 'Etiketter' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-4 xl:px-2">
      {/* Basemap Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base font-semibold text-neutral-900 p-3">Bakgrunnskart</legend>
          <div className="flex flex-wrap gap-2 px-2 py-1">
            {baseMaps.map((item) => {
              const selected = baseMap[perspective] === item.key;
              return (
                <Clickable
                  key={item.key}
                  onClick={() => setBaseMap(perspective, item.key)}
                  role="radio"
                  aria-checked={selected}
                  aria-labelledby={`basemap-label-${item.key}`}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors
                    ${selected ? "bg-accent-800 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"}
                    min-w-[2.5rem]`}
                >
                  <span
                    id={`basemap-label-${item.key}`}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </span>
                </Clickable>
              );
            })}
          </div>
        </fieldset>
      </section>

      {/* Marker Mode Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base font-semibold text-neutral-900 p-3">Markørar</legend>
          <div className="flex flex-wrap gap-2 px-2 py-1">
            {markerModes.map((mode) => {
              const selected = markerMode === mode.key;
              return (
                <Clickable
                  key={mode.key}
                  onClick={() => setMarkerMode(mode.key)}
                  role="radio"
                  aria-checked={selected}
                  aria-labelledby={`markermode-label-${mode.key}`}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors
                    ${selected ? "bg-accent-800 text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"}
                    min-w-[2.5rem]`}
                >
                  <span
                    id={`markermode-label-${mode.key}`}
                    className="whitespace-nowrap"
                  >
                    {mode.label}
                  </span>
                </Clickable>
              );
            })}
          </div>
        </fieldset>
      </section>

      {process.env.NODE_ENV === 'development' && <MapDebugSettings />}
    </div>
  );
}
