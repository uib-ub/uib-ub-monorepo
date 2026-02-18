'use client'
import { baseLayerMaps, overlayLayerMaps } from "@/config/basemap-config";
import { defaultBaseMap } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import ToggleButton from "@/components/ui/toggle-button";
import Clickable from "@/components/ui/clickable/clickable";
import dynamic from "next/dynamic";
import { useDebugStore } from "@/state/zustand/debug-store";
import { useMemo, useState } from "react";
import { PiArrowLeft, PiMagnifyingGlass, PiX } from "react-icons/pi";
import { useSearchParams } from "next/navigation";

const MapDebugSettings = dynamic(() => import("./map-debug-settings"), { ssr: false });

export default function MapSettings() {
  const {
    baseMap,
    overlayMaps,
    markerMode,
    setBaseMap,
    addOverlayMap,
    removeOverlayMap,
    moveOverlayMap,
    clearOverlayMaps,
    setMarkerMode
  } = useMapSettings();
  const searchParams = useSearchParams();
  const debug = useDebugStore((s) => s.debug);
  const [overlaySearch, setOverlaySearch] = useState('');
  const overlaySelectorOpen = searchParams.get('overlaySelector') === 'on';

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
  const availableOverlays = useMemo(() => {
    const selected = new Set(selectedOverlays);
    return overlayLayerMaps.filter((item) => !selected.has(item.key));
  }, [selectedOverlays]);
  const filteredOverlays = useMemo(() => {
    const query = overlaySearch.trim().toLowerCase();
    if (!query) return availableOverlays;
    return availableOverlays.filter((item) => item.name.toLowerCase().includes(query));
  }, [overlaySearch, availableOverlays]);
  const overlayNameByKey = useMemo(() => {
    return overlayLayerMaps.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.name;
      return acc;
    }, {});
  }, []);

  if (overlaySelectorOpen) {
    return (
      <div className="flex flex-col gap-4 pb-4 xl:px-2">
        <section>
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">Overlegg</legend>
            <div className="px-2 py-1 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Clickable
                  link
                  remove={['overlaySelector']}
                  className="btn btn-outline btn-sm w-fit inline-flex items-center"
                >
                  <PiArrowLeft className="text-lg" aria-hidden={true} />
                  Tilbake
                </Clickable>
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
                <legend className="sr-only">Valde overlegg</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md max-h-64 overflow-auto">
                  {selectedOverlays.map((overlayKey, index) => (
                    <li key={overlayKey} className="px-3 py-2 flex flex-wrap items-center gap-2">
                      <span className="min-w-0 basis-full sm:basis-auto sm:flex-1 truncate">{overlayNameByKey[overlayKey] || overlayKey}</span>
                      <div className="ml-auto flex flex-wrap gap-2 max-w-full">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => moveOverlayMap(index, index - 1)}
                          disabled={index === 0}
                        >
                          Opp
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => moveOverlayMap(index, index + 1)}
                          disabled={index === selectedOverlays.length - 1}
                        >
                          Ned
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => removeOverlayMap(overlayKey)}
                        >
                          Fjern
                        </button>
                      </div>
                    </li>
                  ))}
                  {!selectedOverlays.length && (
                    <li className="px-3 py-2 text-neutral-600">Ingen overlegg valde</li>
                  )}
                </ul>
              </fieldset>

              <div className="w-full h-10 relative">
                <input
                  aria-label="Søk i overlegg som kan leggjast til"
                  value={overlaySearch}
                  onChange={(e) => setOverlaySearch(e.target.value)}
                  placeholder="Søk i overlegg"
                  className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PiMagnifyingGlass aria-hidden={true} className="text-neutral-500 text-xl" />
                </span>
              </div>
              <fieldset>
                <legend className="sr-only">Legg til overlegg</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md max-h-64 overflow-auto">
                  {filteredOverlays.map((item) => {
                    return (
                      <li key={item.key} className="px-3 py-2 flex flex-wrap items-center gap-2">
                        <span id={`overlay-label-${item.key}`} className="min-w-0 basis-full sm:basis-auto sm:flex-1 truncate">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm ml-auto inline-flex items-center"
                          onClick={() => addOverlayMap(item.key)}
                        >
                          Legg til
                        </button>
                      </li>
                    );
                  })}
                  {!filteredOverlays.length && (
                    <li className="px-3 py-2 text-neutral-600">Ingen fleire overlegg funne</li>
                  )}
                </ul>
              </fieldset>
            </div>
          </fieldset>
        </section>
      </div>
    );
  }

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
        <div className="border-0 p-0 m-0">
          <div className="px-3 py-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-neutral-900">Overlegg</h2>
            <Clickable
              link
              add={{ overlaySelector: 'on' }}
              className="btn btn-outline btn-sm whitespace-nowrap inline-flex items-center"
            >
              {selectedOverlays.length > 0 ? 'Endre' : 'Legg til'}
            </Clickable>
          </div>
          <div className="px-2 py-1 flex items-start gap-2">
            <div className="flex flex-wrap gap-2 flex-1 min-w-0">
              {selectedOverlays.map((overlayKey) => (
                <button
                  type="button"
                  key={overlayKey}
                  onClick={() => removeOverlayMap(overlayKey)}
                  className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1 cursor-pointer text-sm hover:bg-neutral-50 min-w-0 max-w-full"
                >
                  <span className="truncate">{overlayNameByKey[overlayKey] || overlayKey}</span>
                  <PiX className="ml-auto text-lg flex-shrink-0" aria-hidden="true" />
                </button>
              ))}
              {!selectedOverlays.length && (
                <div className="px-1 py-1.5 text-neutral-600 text-sm">Ingen overlegg valde</div>
              )}
            </div>
            {selectedOverlays.length > 0 && (
              <button
                type="button"
                onClick={() => clearOverlayMaps()}
                className="py-1.5 px-2 text-sm whitespace-nowrap text-neutral-800 hover:text-neutral-950"
              >
                Nullstill
              </button>
            )}
          </div>
        </div>
      </section>

      {debug && <MapDebugSettings />}
    </div>
  );
}
