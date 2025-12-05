'use client'
import { baseMaps } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import ToggleButton from "@/components/ui/toggle-button";
import { usePerspective } from "@/lib/param-hooks";
import dynamic from "next/dynamic";
import { useDebugStore } from "@/state/zustand/debug-store";

const MapDebugSettings = dynamic(() => import("./map-debug-settings"), { ssr: false });

export default function MapSettings() {
  const { baseMap, markerMode, setBaseMap, setMarkerMode } = useMapSettings();
  const perspective = usePerspective();
  const debug = useDebugStore((s) => s.debug);

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
                <ToggleButton
                  key={item.key}
                  isSelected={selected}
                  onClick={() => setBaseMap(perspective, item.key)}
                  role="radio"
                  ariaChecked={selected}
                  ariaLabelledBy={`basemap-label-${item.key}`}
                >
                  <span
                    id={`basemap-label-${item.key}`}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </span>
                </ToggleButton>
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
                <ToggleButton
                  key={mode.key}
                  isSelected={selected}
                  onClick={() => setMarkerMode(mode.key)}
                  role="radio"
                  ariaChecked={selected}
                  ariaLabelledBy={`markermode-label-${mode.key}`}
                >
                  <span
                    id={`markermode-label-${mode.key}`}
                    className="whitespace-nowrap"
                  >
                    {mode.label}
                  </span>
                </ToggleButton>
              );
            })}
          </div>
        </fieldset>
      </section>

      {debug && <MapDebugSettings />}
    </div>
  );
}
