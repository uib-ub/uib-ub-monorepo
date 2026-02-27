'use client'
import { baseLayerMaps, overlayLayerMaps } from "@/config/basemap-config";
import { defaultBaseMap } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import ToggleButton from "@/components/ui/toggle-button";
import Clickable from "@/components/ui/clickable/clickable";
import IconButton from "@/components/ui/icon-button";
import dynamic from "next/dynamic";
import { useDebugStore } from "@/state/zustand/debug-store";
import { useContext, useMemo, useState } from "react";
import { PiCaretDownBold, PiCaretRightBold, PiCaretUpBold, PiMagnifyingGlass, PiPlusBold, PiX } from "react-icons/pi";
import { useSearchParams } from "next/navigation";
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "../ui/clickable/clickable-icon";
import WarningMessage from "../search/details/group/warning-message";
import { useSessionStore } from "@/state/zustand/session-store";

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
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
  const debug = useDebugStore((s) => s.debug);
  const [overlaySearch, setOverlaySearch] = useState('');
  const overlaySelectorOpen = searchParams.get('overlaySelector') === 'on';
  const { mapFunctionRef } = useContext(GlobalContext);

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
  const overlayMetaByKey = useMemo(() => {
    return overlayLayerMaps.reduce<Record<string, { name: string; provider?: string }>>((acc, item) => {
      acc[item.key] = { name: item.name, provider: item.provider };
      return acc;
    }, {});
  }, []);

  if (overlaySelectorOpen) {
    return (
        <section className="flex flex-col gap-8 pb-4 xl:px-2">
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">Kartlag</legend>
            <div className="px-2 py-1 flex flex-col gap-3">
              <div className="w-full h-10 relative">
                <input
                  aria-label="Søk i overlegg som kan leggjast til"
                  value={overlaySearch}
                  onChange={(e) => setOverlaySearch(e.target.value)}
                  placeholder="Søk i overlegg"
                  className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PiMagnifyingGlass aria-hidden={true} className="text-neutral-700 text-xl" />
                </span>
              </div>

              <fieldset>
                <legend className="sr-only">Legg til overlegg</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md overflow-hidden">
                  {filteredOverlays.map((item) => {
                    return (
                      <li key={item.key}>
                        <Clickable
                          aria-label={`Legg til overlegg ${item.name}`}
                          remove={['overlaySelector']}
                          className="w-full px-3 py-2 flex justify-between items-center gap-2 text-left bg-white hover:bg-neutral-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                          onClick={() => {
                            addOverlayMap(item.key);
                            setOverlaySearch('');

                            const map = mapFunctionRef?.current;
                            const bounds = item.bounds;
                            // set drawer position to middle
                            setSnappedPosition('middle');

                            if (map && bounds) {
                              try {
                                const center = map.getCenter?.();
                                const [[north, west], [south, east]] = bounds;

                                let isInside = false;
                                if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
                                  const { lat, lng } = center;
                                  isInside =
                                    lat <= north &&
                                    lat >= south &&
                                    lng >= west &&
                                    lng <= east;
                                }

                                if (!isInside) {
                                  map.fitBounds(
                                    [
                                      [north, west],
                                      [south, east]
                                    ],
                                    { maxZoom: 8, duration: 0.25 }
                                  );
                                }
                              } catch (error) {
                                console.warn('Failed to adjust map to overlay bounds', error);
                              }
                            }
                          }}
                        >
                          <span id={`overlay-label-${item.key}`} className="min-w-0 flex-1">
                            <span className="block truncate text-neutral-900">{item.name}</span>
                            {item.provider && <span className="block text-xs text-neutral-700 truncate">{item.provider}</span>}
                          </span>
                          <span className="ml-2 text-xl text-primary-700 flex-shrink-0" aria-hidden={true}>
                            <PiPlusBold />
                          </span>
                        </Clickable>
                      </li>
                    );
                  })}
                  {!filteredOverlays.length && (
                    <li className="px-3 py-2 text-neutral-700">Ingen fleire overlegg funne</li>
                  )}
                </ul>
              </fieldset>
            </div>
          </fieldset>
        </section>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4 xl:px-2">
      {/* Marker Mode Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base text-neutral-900 pl-3 pr-2 py-2 w-full">
            <div className="flex flex-wrap items-center gap-3 justify-between w-full">
              <span className="text-lg text-neutral-800">Markørar</span>
              <div className="flex flex-wrap gap-2">
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
            </div>
          </legend>
        </fieldset>
      </section>

      {/* Basemap Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-base text-neutral-900 pl-3 pr-2 py-2 w-full">
            <div className="flex flex-wrap items-center gap-3 justify-between w-full">
              <span className="text-lg text-neutral-800">Bakgrunnslag</span>
              <div className="flex flex-wrap gap-2">
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
            </div>
          </legend>
        </fieldset>
      </section>

      <section>
        <fieldset className="border-0 p-0 m-0">
          <div className="flex gap-3 items-center">
          <legend className="text-lg text-neutral-800 p-3 w-full justify-between">Andre kartlag</legend>
          <div className="flex gap-2 px-2">
          {selectedOverlays.length > 0 && <Clickable onClick={() => clearOverlayMaps()} className="btn btn-outline btn-sm whitespace-nowrap inline-flex items-center">
            Nullstill
          </Clickable>}
          <Clickable
                link
                add={{ overlaySelector: "on" }}
                className="btn btn-outline btn-sm whitespace-nowrap inline-flex items-center"
              >
                Legg til
          </Clickable>
          </div>
          </div>
          <div className="px-2 py-1 flex flex-col gap-3">
            {selectedOverlays.length > 2 && (
              <WarningMessage
                message="Mange ekstra kartlag kan gjere kartet tregare å bruke."
                messageId="overlay-performance-warning"
              />
            )}

            {selectedOverlays.length > 0 && (
              <fieldset>
                <legend className="sr-only">Aktive kartlag</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md">
                  {selectedOverlays.map((overlayKey, index) => (
                    <li key={overlayKey} className="p-2 flex items-start gap-3">
                      <div className="flex flex-col gap-1">
                        <IconButton
                          label="Flytt kartlag opp"
                          className="text-sm aspect-square btn btn-outline btn-sm p-1 h-6 w-6 min-h-0"
                          onClick={() => moveOverlayMap(index, index - 1)}
                          disabled={index === 0}
                        >
                          <PiCaretUpBold />
                        </IconButton>
                        <IconButton
                          label="Flytt kartlag ned"
                          className="text-sm aspect-square btn btn-outline btn-sm p-1 h-6 w-6 min-h-0"
                          onClick={() => moveOverlayMap(index, index + 1)}
                          disabled={index === selectedOverlays.length - 1}
                        >
                          <PiCaretDownBold />
                        </IconButton>
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{overlayMetaByKey[overlayKey]?.name || overlayKey}</span>
                        {overlayMetaByKey[overlayKey]?.provider && (
                          <span className="block text-xs text-neutral-700 truncate">
                            {overlayMetaByKey[overlayKey]?.provider}
                          </span>
                        )}
                      </span>
                      <div className="ml-auto">
                        <IconButton
                          label="Fjern kartlag"
                          className="text-lg aspect-square btn btn-outline btn-sm p-2"
                          onClick={() => removeOverlayMap(overlayKey)}
                        >
                          <PiX />
                        </IconButton>
                      </div>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </div>
        </fieldset>
      </section>

      {debug && <MapDebugSettings />}
    </div>
  );
}
