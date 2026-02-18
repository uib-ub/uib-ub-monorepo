'use client'
import { baseLayerMaps, overlayLayerMaps } from "@/config/basemap-config";
import { defaultBaseMap } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import ToggleButton from "@/components/ui/toggle-button";
import dynamic from "next/dynamic";
import { useDebugStore } from "@/state/zustand/debug-store";
import { useMemo, useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";

const MapDebugSettings = dynamic(() => import("./map-debug-settings"), { ssr: false });

export default function MapSettings() {
  const { baseMap, overlayMaps, markerMode, setBaseMap, toggleOverlayMap, clearOverlayMaps, setMarkerMode } = useMapSettings();
  const debug = useDebugStore((s) => s.debug);
  const [overlaySearch, setOverlaySearch] = useState('');

  // Add state for h3 resolution

  const markerModes = [
    { key: 'auto', label: 'Automatisk' },
    { key: 'counts', label: 'Klynger' },
    { key: 'labels', label: 'Etikettar' },
    { key: 'points', label: 'Punkter' },
  ];
  const orderedBaseLayerMaps = useMemo(() => {
    const defaultKey = defaultBaseMap || baseLayerMaps[0]?.key;
    if (!defaultKey) return baseLayerMaps;
    return [...baseLayerMaps].sort((a, b) => {
      if (a.key === defaultKey) return -1;
      if (b.key === defaultKey) return 1;
      return 0;
    });
  }, []);
  const selectedOverlays = overlayMaps || [];
  const filteredOverlays = useMemo(() => {
    const query = overlaySearch.trim().toLowerCase();
    if (!query) return overlayLayerMaps;
    return overlayLayerMaps.filter((item) => item.name.toLowerCase().includes(query));
  }, [overlaySearch]);

  return (
    <div className="flex flex-col gap-4 pb-4 xl:px-2">
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

      {/* Basemap Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base font-semibold text-neutral-900 p-3">Bakgrunnslag</legend>
          <div className="flex flex-wrap gap-2 px-2 py-1">
            {orderedBaseLayerMaps.map((item) => {
              const selected = baseMap === item.key;
              return (
                <ToggleButton
                  key={item.key}
                  isSelected={selected}
                  onClick={() => setBaseMap(item.key)}
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

      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base font-semibold text-neutral-900 p-3">Overlegg</legend>
          <div className="px-2 py-1 flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <div className="w-full h-10 relative">
                <input
                  aria-label="Søk i overlegg"
                  value={overlaySearch}
                  onChange={(e) => setOverlaySearch(e.target.value)}
                  placeholder="Søk i overlegg"
                  className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PiMagnifyingGlass aria-hidden={true} className="text-neutral-500 text-xl" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => clearOverlayMaps()}
                disabled={selectedOverlays.length === 0}
                className="btn btn-outline btn-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Nullstill
              </button>
            </div>
            <fieldset>
              <legend className="sr-only">Vel overlegg</legend>
              <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md max-h-64 overflow-auto">
                {filteredOverlays.map((item) => {
                  const selected = selectedOverlays.includes(item.key);
                  return (
                    <li key={item.key} className="px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleOverlayMap(item.key)}
                        />
                        <span id={`overlay-label-${item.key}`} className="whitespace-nowrap">
                          {item.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
                {!filteredOverlays.length && (
                  <li className="px-3 py-2 text-neutral-600">Ingen overlegg funne</li>
                )}
              </ul>
            </fieldset>
          </div>
        </fieldset>
      </section>

      {debug && <MapDebugSettings />}
    </div>
  );
}
